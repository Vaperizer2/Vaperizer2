// src/shaders/common.vert
// Vertex shader for common functionality

uniform float u_time;
varying vec2 vUv;
void main() {
  vUv = uv;

    vec4 position = vec4(position, 1.0);
    position.y += sin(u_time + position.x * 8.0)/8.0;

  gl_Position = projectionMatrix * modelViewMatrix * position;
}
