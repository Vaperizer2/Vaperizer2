// Moving wave.frag to new location
uniform float u_time;
varying vec2 vUv;

void main() {
  float wave = sin(vUv.x * 10.0 + u_time) * 0.1;
  vec3 color = vec3(vUv.x + wave, vUv.y, 0.5 + wave);
  gl_FragColor = vec4(color, 1.0);
}
