import * as THREE from 'three';
import backGroundShader from './backGroundShader'

class BackGroudRenderer{
    constructor(threeRenderer, resolution){

        let pars = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat };
        this.resolution = resolution;
        this.renderTarget = new THREE.WebGLRenderTarget(resolution.x,resolution.y, pars);
        this.renderTarget.texture.generateMipmaps = false;

        this.backGroundMaterial = new THREE.ShaderMaterial({
            uniforms:backGroundShader.uniforms,
            vertexShader:backGroundShader.vertexShader,
            fragmentShader:backGroundShader.fragmentShader
        });

        this.renderer = threeRenderer;
        this.scene = new THREE.Scene();
        this.camera = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );

        this.quad = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), this.backGroundMaterial );
        this.quad.position.set(0,0,-1);
	    this.quad.frustumCulled = false; // Avoid getting clipped
	    this.scene.add( this.quad );
    }
    render(){
        this.backGroundMaterial.uniforms["u_resolution"].value = this.resolution;
        this.backGroundMaterial.uniforms["u_time"].value = performance.now();
        this.renderer.render( this.scene, this.camera, this.renderTarget, true );
    }
}
export default BackGroudRenderer;