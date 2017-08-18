var threShader = {
     uniforms: {
		"threshold": { value: 0.2 },
        "tDiffuse":{value:null}
	},

	vertexShader: [
		"varying vec2 vUv;",
		"void main() {",
			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
		"}"
	].join( "\n" ),

	fragmentShader: [

		`
        uniform float threshold;
		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {
			vec4 color = texture2D(tDiffuse, vUv);

            if(color.g > threshold)
                gl_FragColor = vec4(1,1,1,1);
            else
                gl_FragColor = vec4(0.93,0.93,0.93,1);
		}
        `

	].join( "\n" )
}