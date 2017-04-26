var inv255 = .003921569;
let numOfBox = 3;

function Renderer() {
    // water mesh
    this.maxVertices = 10000;
    this.waterPositions = new Float32Array(this.maxVertices*3);
    this.waterColors = new Float32Array(this.maxVertices*3);

    var waterGeometry = new THREE.BufferGeometry();
    waterGeometry.dynamic = true;
    waterGeometry.addAttribute('position', new THREE.BufferAttribute( this.waterPositions, 3 ));
    // waterGeometry.addAttribute('color', new THREE.BufferAttribute( this.waterColors, 3 ));
    this.waterIndex = 0;
    this.waterPoints = new THREE.Points(waterGeometry, new THREE.PointsMaterial({color:0x0000ff, size:0.05}));

    // box mesh
    this.boxIndex = 0;
    this.boxPositions = new Float32Array(numOfBox*6*3);
    var boxGeometry = new THREE.BufferGeometry();
    boxGeometry.addAttribute('position', new THREE.BufferAttribute( this.boxPositions, 3 ));
    this.boxMesh = new THREE.Mesh(boxGeometry, new THREE.MeshBasicMaterial( { color: 0xff0000 } ));

    scene.add(this.boxMesh);
    scene.add(this.waterPoints);
}

Renderer.prototype.setUnusedBuffer = function() {
    var i = this.waterIndex * 3;
    for (; i < this.maxVertices*3 ; i+=3) {
        this.waterPositions[i] = 0;
        this.waterPositions[i+1] = 10;
        this.waterPositions[i+2] = 0;
    }
};

Renderer.prototype.draw = function() {

    this.waterIndex = 0;
    this.boxIndex = 0;

    for (var i = 0, max = world.bodies.length; i < max; i++) {
        var body = world.bodies[i];
        var maxFixtures = body.fixtures.length;
        var transform = body.GetTransform();
        for (var j = 0; j < maxFixtures; j++) {
            var fixture = body.fixtures[j];
            fixture.shape.draw(transform);
        }
    }

    // draw particle systems
    for (var i = 0; i < world.particleSystems.length; i++) {
        drawParticleSystem(world.particleSystems[i]);
    }

    this.setUnusedBuffer();

    this.waterPoints.geometry.attributes.position.needsUpdate = true;
    // this.waterPoints.geometry.attributes.color.needsUpdate = true;

    this.boxMesh.geometry.attributes.position.needsUpdate = true;
};

Renderer.prototype.insertParticleVertices = function(x, y) {
    
    var i = this.waterIndex;
    var threeI = i * 3;
    this.waterPositions[threeI] = x;
    this.waterPositions[threeI + 1] = y;
    this.waterPositions[threeI + 2] = 0;
    this.waterIndex++;
};

Renderer.prototype.insertTriangle = function(x1,y1,x2,y2,x3,y3){

    var i = this.boxIndex;
    var threeI = i * 3;
    this.boxPositions[threeI] = x1;
    this.boxPositions[threeI + 1] = y1;
    this.boxPositions[threeI + 2] = 0;

    i++;
    threeI = i * 3;
    this.boxPositions[threeI] = x2;
    this.boxPositions[threeI + 1] = y2;
    this.boxPositions[threeI + 2] = 0;

    i++;
    threeI = i * 3;
    this.boxPositions[threeI] = x3;
    this.boxPositions[threeI + 1] = y3;
    this.boxPositions[threeI + 2] = 0;
    this.boxIndex += 3;

}
Renderer.prototype.transformAndInsert = function(v1, v2, v3, transform) {
    let transformedV1 = new b2Vec2();
    let transformedV2 = new b2Vec2();
    let transformedV3 = new b2Vec2();

    b2Vec2.Mul(transformedV1, transform, v1);
    b2Vec2.Mul(transformedV2, transform, v2);
    b2Vec2.Mul(transformedV3, transform, v3);
    renderer.insertTriangle(transformedV1.x, transformedV1.y,transformedV2.x, transformedV2.y,transformedV3.x, transformedV3.y);
};

Renderer.prototype.transformVerticesAndInsert = function(vertices, transform) {
    
    renderer.transformAndInsert(vertices[0], vertices[1], vertices[2],transform);
    renderer.transformAndInsert(vertices[0], vertices[2], vertices[3],transform);
};

b2PolygonShape.prototype.draw = function(transform) {

    renderer.transformVerticesAndInsert(this.vertices, transform);
};

function drawParticleSystem(system) {
    var particles = system.GetPositionBuffer();
    // var color = system.GetColorBuffer();

    for (var i = 0; i < particles.length; i += 2) {
        renderer.insertParticleVertices(particles[i],particles[i + 1]);
    }
}
