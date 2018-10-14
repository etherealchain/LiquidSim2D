uniform float threshold;
uniform sampler2D tDiffuse;

varying vec2 vUv;

void main() {
    vec4 color = texture2D(tDiffuse, vUv);

    if( color.r > threshold ){
        discard;
    }
    else{
        gl_FragColor = color;
    }
}