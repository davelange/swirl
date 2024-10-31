uniform sampler2D uTexture;
uniform sampler2D uDisplacement;
uniform float uTime;

varying vec2 vUv;

float PI = 3.141592653589793238;

void main() {
    vec2 uv = vUv;
    uv.x *= 1.1;
    uv.y *= 1.1;
    uv.y += uTime * 0.2;
    float displacement = texture(uDisplacement, uv).r;
    displacement = smoothstep(0.3, 0.55, displacement);

    vec4 texture = texture2D(uTexture, vUv);

    //gl_FragColor = vec4(0.0, 0.0, 1.0, displacement * texture.a);
    gl_FragColor = vec4(0.0, 0.0, 1.0, texture.a);

    #include <tonemapping_fragment>
}