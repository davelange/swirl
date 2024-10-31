uniform sampler2D uTexture;
uniform sampler2D uDisplacement;
uniform float uTime;
uniform vec2 uMouse;

varying vec2 vUv;

float PI = 3.141592653589793238;
float maxRadius = 0.07;

float threshold = 0.05;
float edgeSmoothness = 0.1;
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

    // Blend to bg on green
    float blendFactor = smoothstep(threshold - edgeSmoothness, threshold + edgeSmoothness, displacement.g);
    vec4 stage1 = mix(bgTexture, bgColor, blendFactor);

    float dist = distance(vUv, uMouse);

    if(dist < maxRadius) {
        float phase = dist - uTime * 0.1;

        float ripple = 0.02 * exp(-phase * 2.0) * sin(10.0 * phase);

        vec2 rippleUv = vUv + normalize(vUv - uMouse) * ripple;

        vec4 rippedTex = texture2D(uTexture, rippleUv);

        float blendFactor2 = smoothstep(threshold - edgeSmoothness, threshold + edgeSmoothness, displacement.g);

        gl_FragColor = mix(stage1, rippedTex, blendFactor2);
    } else {
        gl_FragColor = stage1;
    }

}