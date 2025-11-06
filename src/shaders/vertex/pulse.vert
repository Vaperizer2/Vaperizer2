// Vertex shader with pulsating effect
uniform float u_time;
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

void main() {
  vUv = uv;
  vNormal = normalize(normalMatrix * normal);
  vPosition = position;
  
  // Create breathing/pulsating effect
  float scaleFactor = 1.0 + sin(u_time) * 0.1;
  vec3 pos = position * scaleFactor;
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
