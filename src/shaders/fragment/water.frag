// Water ripple effect shader
uniform float u_time;
varying vec2 vUv;

void main() {
  // Parameters
  float speed = 2.0;
  float rippleCount = 20.0;
  float rippleSize = 15.0;
  
  // Create multiple ripples
  float ripple1 = sin((vUv.x * rippleSize + u_time * speed) * 3.14);
  float ripple2 = sin((vUv.y * rippleSize + u_time * speed) * 3.14);
  float ripple3 = sin(((vUv.x + vUv.y) * rippleSize + u_time * speed) * 3.14);
  
  // Combine ripples
  float ripples = ripple1 * ripple2 * ripple3;
  
  // Create water depth effect based on Y position
  float depth = smoothstep(0.0, 1.0, vUv.y);
  
  // Light blue to darker blue based on depth
  vec3 shallowColor = vec3(0.0, 0.6, 0.8);
  vec3 deepColor = vec3(0.0, 0.2, 0.5);
  vec3 baseColor = mix(shallowColor, deepColor, depth);
  
  // Add white foam based on ripples
  vec3 foamColor = vec3(0.9, 0.95, 1.0);
  float foam = smoothstep(0.3, 0.6, ripples);
  
  // Final color
  vec3 finalColor = mix(baseColor, foamColor, foam * 0.3);
  
  gl_FragColor = vec4(finalColor, 0.9);
}
