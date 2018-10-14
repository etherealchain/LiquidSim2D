uniform vec2 u_resolution;
uniform float u_time;
uniform vec3 intervalColor;
uniform vec3 brickColor;

vec2 brickTile(vec2 _st, float _zoom){
    _st *= _zoom;

    // moving
    float velocity = 0.0005;
    _st += vec2(velocity*u_time);

    // offset bricks
    _st.x += step(1., mod(_st.y,2.0)) * 0.45;
    return fract(_st);
}

vec3 box(vec2 _st, vec2 _size){
    _size = vec2(0.5)-_size*0.5;
    vec2 uv = smoothstep(_size, _size+vec2(1e-4), _st);
    uv *= smoothstep(_size, _size+vec2(1e-4), vec2(1.0)-_st);
    float alpha = uv.x*uv.y;
    return mix(intervalColor, brickColor, alpha);
}

void main(void){
    vec2 st;
    if(u_resolution.x > u_resolution.y){
        st = gl_FragCoord.xy/u_resolution.yy;
    }
    else{
        st = gl_FragCoord.xy/u_resolution.xx;
    }

    // Modern metric brick of 215mm x 102.5mm x 65mm
    // http://www.jaharrison.me.uk/Brickwork/Sizes.html
    st /= vec2(1.5,0.65);

    // Apply the brick tiling
    st = brickTile(st,15.0);
    vec3 color = box(st,vec2(0.9));

    gl_FragColor = vec4(color,1.0);
}