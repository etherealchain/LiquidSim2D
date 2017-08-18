var inv255 = .003921569;
var numOfBox = 3;
var textureSize = 1024;

function Renderer() {

    let waterScene = new THREE.Scene();
    // composer
    this.composer = new THREE.EffectComposer(threeRenderer);
    
    let renderPass = new THREE.RenderPass(waterScene, camera);
    let waterPass = new WaterPass(new THREE.Vector2(windowWidth,windowHeight));
    let copyPass = new THREE.ShaderPass(THREE.CopyShader);
	copyPass.renderToScreen = true;
    // this.colorPass = new THREE.ShaderPass();

    this.composer.addPass(renderPass);
    this.composer.addPass(waterPass);
    // this.composer.addPass(copyPass);

    // water mesh
    this.maxVertices = 10000;
    this.waterPositions = new Float32Array(this.maxVertices*3);
    this.waterColors = new Float32Array(this.maxVertices*3);

    let waterGeometry = new THREE.BufferGeometry();
    waterGeometry.dynamic = true;
    waterGeometry.addAttribute('position', new THREE.BufferAttribute( this.waterPositions, 3 ));
    waterGeometry.addAttribute('color', new THREE.BufferAttribute( this.waterColors, 3 ));
    this.waterIndex = 0;

    let waterMaterial = new THREE.ShaderMaterial({
        uniforms: THREE.UniformsUtils.merge( [
			THREE.UniformsLib.points,
			THREE.UniformsLib.fog
		] ),
        vertexShader: document.getElementById('vertexShader').textContent,
        fragmentShader: document.getElementById('fragmentShader').textContent,
        vertexColors:THREE.VertexColors
    });
    waterMaterial.uniforms.size.value = 6;

    this.waterPoints = new THREE.Points(waterGeometry, waterMaterial);

    // box mesh
    this.boxIndex = 0;
    this.boxPositions = new Float32Array(numOfBox*6*3);
    var boxGeometry = new THREE.BufferGeometry();
    boxGeometry.addAttribute('position', new THREE.BufferAttribute( this.boxPositions, 3 ));
    this.boxMesh = new THREE.Mesh(boxGeometry, new THREE.MeshBasicMaterial( { color: 0x8C5C10 } ));

    // hud
    this.hud = new THREE.WebGLRenderTarget( textureSize, textureSize, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat } );
    let plane = new THREE.Mesh(new THREE.PlaneBufferGeometry(4,1,1,1),new THREE.MeshBasicMaterial({color:0xffffff, map:this.composer.readBuffer.texture}) );
    plane.position.set(0,1,-1);
    // this.plane = new THREE.Mesh(
    //     new THREE.PlaneBufferGeometry(2,2,1,1), 
    //     new THREE.ShaderMaterial( {
    //         uniforms: {"tex":{value:null}},
    //         vertexShader: document.getElementById( 'debugVS' ).textContent,
    //         fragmentShader: document.getElementById( 'debugFS' ).textContent
    //     } ));
    // this.plane.material.uniforms["tex"].value = this.debug.texture;


    scene.add(this.boxMesh);
    waterScene.add(this.waterPoints);
}

Renderer.prototype.resetBuffer = function() {
    for (let i = 0; i < this.maxVertices*3 ; i+=3) {
        this.waterPositions[i] = 0;
        this.waterPositions[i+1] = 0;
        this.waterPositions[i+2] = 0;
    }
};



Renderer.prototype.draw = function() {

    this.waterIndex = 0;
    this.boxIndex = 0;
    this.resetBuffer();

    // draw particle systems
    for (var i = 0; i < world.particleSystems.length; i++) {
        drawParticleSystem(world.particleSystems[i]);
    }
    
    this.waterPoints.geometry.attributes.position.needsUpdate = true;
    this.waterPoints.geometry.attributes.color.needsUpdate = true;
    
    
    this.composer.render();

    for (var i = 0, max = world.bodies.length; i < max; i++) {
        var body = world.bodies[i];
        var maxFixtures = body.fixtures.length;
        var transform = body.GetTransform();
        for (var j = 0; j < maxFixtures; j++) {
            var fixture = body.fixtures[j];
            fixture.shape.draw(transform);
        }
    }

    this.boxMesh.geometry.attributes.position.needsUpdate = true;
    
};

Renderer.prototype.insertParticleVertices = function(x, y, r, g, b) {
    
    var i = this.waterIndex;
    var threeI = i * 3;
    this.waterPositions[threeI] = x;
    this.waterPositions[threeI + 1] = y;
    this.waterPositions[threeI + 2] = 0;
    this.waterColors[threeI] = r;
    this.waterColors[threeI + 1] = g;
    this.waterColors[threeI + 2] = b;

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

b2CircleShape.prototype.draw = function(transform){
    
}

function drawParticleSystem(system) {
    var particles = system.GetPositionBuffer();
    var color = system.GetColorBuffer();

    for (var i = 0, c = 0; i < particles.length; i += 2, c += 4) {
        renderer.insertParticleVertices(particles[i],particles[i + 1], color[c]*inv255, color[c+1]*inv255, color[c+2]*inv255);
    }
}