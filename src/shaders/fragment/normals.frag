// Normal map visualization shader
uniform float u_time;
varying vec2 vUv;
varying vec3 vNormal;

void main() {
  // Convert normal from [-1,1] to [0,1] range
  vec3 normalColor = normalize(vNormal) * 0.5 + 0.5;
  gl_FragColor = vec4(normalColor, 1.0);
}
