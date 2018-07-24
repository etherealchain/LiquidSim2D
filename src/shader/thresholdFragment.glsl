uniform float threshold;
uniform sampler2D tDiffuse;

varying vec2 vUv;

void main() {
    vec4 color = texture2D(tDiffuse, vUv);

    if(color.g > threshold)
        gl_FragColor = vec4(0.26,0.76,0.96,1);
    else
        gl_FragColor = vec4(0.93,0.93,0.93,1);
}