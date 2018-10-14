import * as THREE from 'three';
import defaultVertex from './shader/defaultVertex.glsl';
import babkGroundFragment from './shader/backGroundFragment.glsl';
var backGroundShader = {

    uniforms: {
		"u_resolution": { value: new THREE.Vector2() },
		"u_time":{value: 0.0},
		"intervalColor":{value:new THREE.Vector3(0.298, 0.0745, 0.0745)},
		"brickColor":{value:new THREE.Vector3(0.749, 0.066667, 0.04313)}
	},
	vertexShader:defaultVertex,
	fragmentShader:babkGroundFragment
};
export default backGroundShader;