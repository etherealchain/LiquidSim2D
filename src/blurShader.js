import * as THREE from 'three';
import defaultVertex from './shader/defaultVertex.glsl';
import blurFragment from './shader/blurFragment.glsl';
var blurShader = {
    uniforms: {

		"iResolution": { value: new THREE.Vector2() },
        "direction":{value: new THREE.Vector2()},
        "tDiffuse":{value:null}
	},
	vertexShader:defaultVertex,
	fragmentShader:blurFragment
}
export default blurShader;