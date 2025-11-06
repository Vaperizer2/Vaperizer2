// Moving colorShift.frag to new location
uniform float u_time;
varying vec2 vUv;

void main() {
  vec3 color = vec3(sin(u_time + vUv.x * 3.0), cos(vUv.y * 2.0), sin(u_time * 0.5));
  gl_FragColor = vec4(color, 1.0);
}
