// Gridlines shader
uniform float u_time;
varying vec2 vUv;

void main() {
  // Create grid pattern
  float gridSize = 20.0;
  vec2 grid = fract(vUv * gridSize);
  float lineWidth = 0.05;
  
  // Animate line width
  lineWidth += sin(u_time) * 0.02;
  
  // Draw grid lines
  float xLine = step(grid.x, lineWidth) + step(1.0 - grid.x, lineWidth);
  float yLine = step(grid.y, lineWidth) + step(1.0 - grid.y, lineWidth);
  
  // Combine for final grid
  float grid_pattern = max(xLine, yLine);
  
  // Base color with time animation
  vec3 baseColor = vec3(0.1, 0.3, 0.5) + vec3(0.2) * sin(u_time);
  vec3 lineColor = vec3(0.9, 0.9, 1.0);
  
  // Mix base color with grid lines
  vec3 finalColor = mix(baseColor, lineColor, grid_pattern);
  
  gl_FragColor = vec4(finalColor, 1.0);
}
