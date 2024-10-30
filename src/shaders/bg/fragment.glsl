uniform sampler2D uTexture;
uniform sampler2D uDisplacement;

varying vec2 vUv;

float PI = 3.141592653589793238;

void main() {

    vec4 displacement = texture2D(uDisplacement, vUv);

    float theta = displacement.r * 2.0 * PI;
    vec2 dir = vec2(sin(theta), cos(theta));
    vec2 uv = vUv + dir * displacement.r * 0.1;

    vec4 texture = texture2D(uTexture, uv);

    gl_FragColor = texture;
}