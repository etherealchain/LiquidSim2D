import defaultVertex from './shader/defaultVertex.glsl';
import thresholdFragment from './shader/thresholdFragment.glsl';
var threShader = {
     uniforms: {
		"threshold": { value: 0.2 },
        "tDiffuse":{value:null}
	},

	vertexShader: defaultVertex,
	fragmentShader: thresholdFragment
}
export default threShader;