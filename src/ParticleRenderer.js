import * as THREE from 'three';
import EffectComposer from './lib/EffectComposer';
import RenderPass from './lib/RenderPass';
import WaterPass from './WaterPass';
import waterVertex from './shader/waterVertex.glsl';
import waterFragment from './shader/waterFragment.glsl';

class ParticleRenderer{
    constructor(threeRenderer, camera, scene, world){
        this.inv255 = .003921569;
        this.numOfBox = 3;
        this.textureSize = 1024;

        let waterScene = new THREE.Scene();
        // composer
        this.composer = new EffectComposer(threeRenderer);
        this.world = world;
        
        let renderPass = new RenderPass(waterScene, camera);
        let waterPass = new WaterPass(new THREE.Vector2(window.innerWidth,window.innerHeight));

        this.composer.addPass(renderPass);
        this.composer.addPass(waterPass);

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
                THREE.UniformsLib.points
            ] ),
            vertexShader: waterVertex,
            fragmentShader: waterFragment,
            vertexColors:THREE.VertexColors
        });
        waterMaterial.uniforms.size.value = 6;

        this.waterPoints = new THREE.Points(waterGeometry, waterMaterial);

        // box mesh
        this.boxIndex = 0;
        this.boxPositions = new Float32Array(this.numOfBox*6*3);
        var boxGeometry = new THREE.BufferGeometry();
        boxGeometry.addAttribute('position', new THREE.BufferAttribute( this.boxPositions, 3 ));
        this.boxMesh = new THREE.Mesh(boxGeometry, new THREE.MeshBasicMaterial( { color: 0x8C5C10 } ));

        // hud
        // this.hud = new THREE.WebGLRenderTarget( this.textureSize, this.textureSize, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat } );
        // let plane = new THREE.Mesh(new THREE.PlaneBufferGeometry(4,1,1,1),new THREE.MeshBasicMaterial({color:0xffffff, map:this.composer.readBuffer.texture}) );
        // plane.position.set(0,1,-1);
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
    resetBuffer(){
        for (let i = 0; i < this.maxVertices*3 ; i+=3) {
            this.waterPositions[i] = 0;
            this.waterPositions[i+1] = 0;
            this.waterPositions[i+2] = 0;
        }
    }
    draw(){
        this.waterIndex = 0;
        this.boxIndex = 0;
        this.resetBuffer();

        // draw particle systems
        for (var i = 0; i < this.world.particleSystems.length; i++) {
            this.drawParticleSystem(this.world.particleSystems[i]);
        }

        // draw box
        for (var i = 0, max = this.world.bodies.length; i < max; i++) {
            var body = this.world.bodies[i];
            var maxFixtures = body.fixtures.length;
            var transform = body.GetTransform();
            for (var j = 0; j < maxFixtures; j++) {
                var fixture = body.fixtures[j];
                fixture.shape.draw(transform);
            }
        }

        this.waterPoints.geometry.attributes.position.needsUpdate = true;
        this.waterPoints.geometry.attributes.color.needsUpdate = true;
        this.boxMesh.geometry.attributes.position.needsUpdate = true;
            
        this.composer.render();
    }
    insertParticleVertices(x, y, r, g, b){
        let i = this.waterIndex;
        let threeI = i * 3;
        this.waterPositions[threeI] = x;
        this.waterPositions[threeI + 1] = y;
        this.waterPositions[threeI + 2] = 0;
        this.waterColors[threeI] = r;
        this.waterColors[threeI + 1] = g;
        this.waterColors[threeI + 2] = b;

        this.waterIndex++;
    }
    insertTriangle(x1,y1,x2,y2,x3,y3){
        let i = this.boxIndex;
        let threeI = i * 3;
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
    transformAndInsert(v1, v2, v3, transform){
        let transformedV1 = new b2Vec2();
        let transformedV2 = new b2Vec2();
        let transformedV3 = new b2Vec2();

        b2Vec2.Mul(transformedV1, transform, v1);
        b2Vec2.Mul(transformedV2, transform, v2);
        b2Vec2.Mul(transformedV3, transform, v3);
        this.insertTriangle(transformedV1.x, transformedV1.y,transformedV2.x, transformedV2.y,transformedV3.x, transformedV3.y);
    }
    transformVerticesAndInsert(vertices, transform){
        this.transformAndInsert(vertices[0], vertices[1], vertices[2],transform);
        this.transformAndInsert(vertices[0], vertices[2], vertices[3],transform);
    }
    drawParticleSystem(system){
        let particles = system.GetPositionBuffer();
        let color = system.GetColorBuffer();

        for (let i = 0, c = 0; i < particles.length; i += 2, c += 4) {
            this.insertParticleVertices(particles[i],
                                        particles[i + 1], 
                                        color[c]*this.inv255, 
                                        color[c+1]*this.inv255, 
                                        color[c+2]*this.inv255);
        }
    }
}

export default ParticleRenderer;