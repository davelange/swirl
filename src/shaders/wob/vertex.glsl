varying vec2 vUv;

in vec3 aPos;

uniform float uMouseX;
uniform float uMouseY;

uniform mat4 model;

void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

    vUv = uv;
}