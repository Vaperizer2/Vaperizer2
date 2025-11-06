// Fire effect shader
uniform float u_time;
varying vec2 vUv;

// Noise function for more organic fire
float noise(vec2 p) {
  return sin(p.x * 10.0) * sin(p.y * 10.0) * 0.5 + 0.5;
}

void main() {
  // Fire parameters
  vec2 uv = vUv;
  float y = uv.y;
  
  // Create noise and movement
  float n = noise(vec2(uv.x * 4.0, (uv.y + u_time * 0.5) * 2.0));
  n += noise(vec2(uv.x * 8.0, (uv.y + u_time * 0.8) * 4.0)) * 0.5;
  
  // Create fire shape - stronger at bottom
  float fire = smoothstep(0.0, 1.8, y);
  fire = 1.0 - fire;
  
  // Add noise to fire
  fire *= n;
  
  // Fire colors - from yellow to red
  vec3 col = mix(
    vec3(1.0, 0.5, 0.0),  // Orange
    vec3(1.0, 0.2, 0.0),  // Red
    y              // Mix based on vertical position
  );
  
  // Add some yellow to the bottom
  col = mix(
    vec3(1.0, 0.9, 0.0),  // Yellow
    col,
    smoothstep(0.0, 0.4, y)
  );
  
  // Apply fire intensity to color
  col *= fire;
  
  // Add some glow and prevent pure black
  col += vec3(0.1, 0.0, 0.0) * (1.0 - y);
  
  gl_FragColor = vec4(col, 1.0);
}
