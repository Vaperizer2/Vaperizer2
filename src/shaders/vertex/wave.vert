// Vertex shader with wave animation
uniform float u_time;
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

void main() {
  vUv = uv;
  vNormal = normalize(normalMatrix * normal);
  vPosition = position;
  
  // Create wave effect
  vec3 pos = position;
  float frequency = 2.0;
  float amplitude = 0.1;
  pos.y += sin(pos.x * frequency + u_time) * amplitude;
  pos.y += cos(pos.z * frequency + u_time) * amplitude;
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
