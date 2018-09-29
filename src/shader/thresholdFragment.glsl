uniform float threshold;
uniform sampler2D tDiffuse;

varying vec2 vUv;

void main() {
    vec4 color = texture2D(tDiffuse, vUv);

    if( color.r > threshold ){
        gl_FragColor = vec4(0.6,0.6,0.6,1.0); // background
    }
    else{
        gl_FragColor = color;
    }
}