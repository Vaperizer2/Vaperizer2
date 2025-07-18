import * as THREE from "three";
// Responsive three.js animated background for the hero section

const canvas = document.getElementById('bg-canvas');
const scene = new THREE.Scene();

// Camera setup
let width = canvas.offsetWidth;
let height = canvas.offsetHeight;
let aspect = width / height;
const camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
camera.position.z = 5;

// Renderer
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
renderer.setSize(width, height);

// On resize
function resizeCanvas() {
  width = canvas.offsetWidth;
  height = canvas.offsetHeight;
  aspect = width / height;
  renderer.setSize(width, height);
  camera.aspect = aspect;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resizeCanvas);

// Cool animated geometry: floating glowing spheres
const spheres = [];
const sphereGeometry = new THREE.SphereGeometry(0.09, 16, 16);
const colors = [0x60a5fa, 0xf472b6, 0x34d399, 0xfacc15, 0x818cf8]; // Tailwind palette
for (let i = 0; i < 24; i++) {
  const color = colors[i % colors.length];
  const material = new THREE.MeshBasicMaterial({ color });
  const sphere = new THREE.Mesh(sphereGeometry, material);
  sphere.position.x = (Math.random() - 0.5) * 7;
  sphere.position.y = (Math.random() - 0.5) * 3;
  sphere.position.z = (Math.random() - 0.5) * 4;
  spheres.push(sphere);
  scene.add(sphere);
}

// Light glow effect
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);

// Animate spheres
function animate(t) {
  spheres.forEach((s, i) => {
    s.position.y += Math.sin(t * 0.001 + i) * 0.002;
    s.position.x += Math.cos(t * 0.001 + i) * 0.002;
    s.material.opacity = 0.85 + 0.15 * Math.sin(t * 0.002 + i);
  });
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

// Initial render
resizeCanvas();
animate();
