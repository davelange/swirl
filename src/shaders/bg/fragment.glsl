uniform sampler2D uTexture;
uniform sampler2D uDisplacement;
uniform float uTime;
uniform vec2 uMouse;

varying vec2 vUv;

float PI = 3.141592653589793238;
float maxRadius = 0.07;

float threshold = 0.2;
float edgeSmoothness = 0.2;
vec4 bgColor = vec4(1., 0.97, 0.94, 1.);

float ripples = 0.35;
vec2 scale = vec2(20.0, 20.0);

void main() {
    vec4 displacement = texture(uDisplacement, vUv);

    // Outer Ring displacement
    float theta = displacement.r * 2.0 * PI;
    vec2 dir = vec2(sin(theta), -2.);
    vec2 uv = vUv + dir * displacement.r * 0.05;
    vec4 bgTexture = texture2D(uTexture, uv);

    // Create rippled texture
    float dist = distance(vUv, uMouse);
    float phase = dist - uTime * 0.05;
    //float ripple = 0.2 * exp(-phase * 1.0) * sin(10.0 * phase);
    float ripple = 0.3 * cos(10.0 * phase) / (dist + 1.0);
    vec2 rippleUv = vUv + normalize(vUv - uMouse) * ripple;
    vec4 rippedTex = texture2D(uTexture, rippleUv);

    float blendFactor = smoothstep(threshold - edgeSmoothness, threshold + edgeSmoothness, displacement.g);
    gl_FragColor = mix(bgTexture, rippedTex, blendFactor);

}