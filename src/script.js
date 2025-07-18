import * as THREE from "three";

let scene, camera, renderer, mesh, currentMaterial;
let heroScene, heroCamera, heroRenderer, heroPlanet, heroAtmosphere, heroStars, heroMoons;
const canvas = document.getElementById("shaderCanvas");
const heroCanvas = document.getElementById("bg-canvas");
const selectS = document.getElementById("shaderSelect");
const selectV = document.getElementById("vertexSelect");
const selectM = document.getElementById("meshSelect");
let commonVertexShader;

// Initialize hero background animation
function initHeroBackground() {
    if (!heroCanvas) return;

    heroScene = new THREE.Scene();
    heroCamera = new THREE.PerspectiveCamera(75, heroCanvas.clientWidth / heroCanvas.clientHeight, 0.1, 1000);
    heroRenderer = new THREE.WebGLRenderer({ canvas: heroCanvas, alpha: true });
    heroRenderer.setSize(heroCanvas.clientWidth, heroCanvas.clientHeight);
    heroRenderer.setClearColor(0x000000, 0.9);

    // Create starfield background
    const starsGeometry = new THREE.SphereGeometry(0.05, 8, 8);
    const instanceCount = 2000;

    const starsMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.8
    });

    const instancedMesh = new THREE.InstancedMesh(
        starsGeometry,
        starsMaterial,
        instanceCount
    );

    const matrix = new THREE.Matrix4();
    for (let i = 0; i < instanceCount; i++) {
        const x = (Math.random() - 0.5) * 100;
        const y = (Math.random() - 0.5) * 100;
        const z = (Math.random() - 0.5) * 100;
        matrix.setPosition(x, y, z);
        instancedMesh.setMatrixAt(i, matrix);
    }

    instancedMesh.instanceMatrix.needsUpdate = true; // Ensures the instance matrix updates are sent to the GPU for rendering. Without this, changes to star positions will not be reflected visually.

    heroStars = instancedMesh;
    heroScene.add(instancedMesh);

    // Create main planet
    const planetGeometry = new THREE.SphereGeometry(3, 64, 64);
    const planetMaterial = new THREE.ShaderMaterial({
        transparent: true,
        uniforms: {
            u_time: { value: 0.0 },
            u_resolution: { value: new THREE.Vector2(heroCanvas.clientWidth, heroCanvas.clientHeight) }
        },
        vertexShader: `
            uniform float u_time;
            varying vec2 vUv;
            varying vec3 vNormal;
            varying vec3 vPosition;
            
            void main() {
                vUv = uv;
                vNormal = normalize(normalMatrix * normal);
                vPosition = position;
                
                vec4 modelPosition = modelMatrix * vec4(position, 1.0);
                vec4 viewPosition = viewMatrix * modelPosition;
                vec4 projectedPosition = projectionMatrix * viewPosition;
                
                gl_Position = projectedPosition;
            }
        `,
        fragmentShader: `
            uniform float u_time;
            uniform vec2 u_resolution;
            varying vec2 vUv;
            varying vec3 vNormal;
            varying vec3 vPosition;
            
            void main() {
                // Create planet surface with continents
                vec2 uv = vUv;
                float noise1 = sin(uv.x * 15.0 + u_time * 0.1) * sin(uv.y * 10.0 + u_time * 0.15);
                float noise2 = sin(uv.x * 25.0 + u_time * 0.05) * sin(uv.y * 20.0 + u_time * 0.1);
                float continents = smoothstep(0.1, 0.6, noise1 + noise2 * 0.3);
                
                // Ocean and land colors
                vec3 oceanColor = vec3(0.1, 0.3, 0.8);
                vec3 landColor = vec3(0.2, 0.6, 0.2);
                vec3 mountainColor = vec3(0.4, 0.3, 0.2);
                
                // Cloud layer
                float clouds = sin(uv.x * 20.0 + u_time * 0.2) * sin(uv.y * 15.0 + u_time * 0.25);
                clouds = smoothstep(0.2, 0.8, clouds) * 0.3;
                
                // Mix terrain
                vec3 surfaceColor = mix(oceanColor, landColor, continents);
                surfaceColor = mix(surfaceColor, mountainColor, continents * 0.5);
                
                // Add clouds
                surfaceColor = mix(surfaceColor, vec3(1.0), clouds);
                
                // Simple lighting based on normal
                float lighting = dot(vNormal, normalize(vec3(1.0, 1.0, 1.0))) * 0.5 + 0.5;
                surfaceColor *= lighting;
                
                // Add atmospheric glow
                float fresnel = 1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0));
                vec3 atmosphereColor = vec3(0.3, 0.6, 1.0);
                surfaceColor = mix(surfaceColor, atmosphereColor, fresnel * 0.3);
                
                gl_FragColor = vec4(surfaceColor, 0.9);
            }
        `
    });

    heroPlanet = new THREE.Mesh(planetGeometry, planetMaterial);
    heroPlanet.position.set(-2, 0, -5);
    heroScene.add(heroPlanet);

    // Create atmospheric glow
    const atmosphereGeometry = new THREE.SphereGeometry(3.2, 32, 32);
    const atmosphereMaterial = new THREE.ShaderMaterial({
        transparent: true,
        side: THREE.BackSide,
        uniforms: {
            u_time: { value: 0.0 }
        },
        vertexShader: `
            uniform float u_time;
            varying vec3 vNormal;
            
            void main() {
                vNormal = normalize(normalMatrix * normal);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float u_time;
            varying vec3 vNormal;
            
            void main() {
                float fresnel = dot(vNormal, vec3(0.0, 0.0, 1.0));
                fresnel = pow(fresnel, 2.0);
                
                vec3 atmosphereColor = vec3(0.3, 0.6, 1.0);
                float pulse = sin(u_time * 0.5) * 0.1 + 0.9;
                
                gl_FragColor = vec4(atmosphereColor, fresnel * 0.4 * pulse);
            }
        `
    });

    heroAtmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    heroAtmosphere.position.copy(heroPlanet.position);
    heroScene.add(heroAtmosphere);

    // Create orbiting moons
    heroMoons = [];
    for (let i = 0; i < 3; i++) {
        const moonGeometry = new THREE.SphereGeometry(0.3, 16, 16);
        const moonMaterial = new THREE.MeshBasicMaterial({
            color: new THREE.Color().setHSL(0.1, 0.3, 0.7),
            transparent: true,
            opacity: 0.8
        });

        const moon = new THREE.Mesh(moonGeometry, moonMaterial);
        moon.userData = {
            orbitRadius: 5 + i * 1.5,
            orbitSpeed: 0.5 + i * 0.2,
            angle: (i * Math.PI * 2) / 3
        };

        heroMoons.push(moon);
        heroScene.add(moon);
    }

    heroCamera.position.set(0, 0, 8);

    // Handle resize for hero background
    const handleHeroResize = () => {
        if (heroCanvas && heroRenderer && heroCamera) {
            heroCamera.aspect = heroCanvas.clientWidth / heroCanvas.clientHeight;
            heroCamera.updateProjectionMatrix();
            heroRenderer.setSize(heroCanvas.clientWidth, heroCanvas.clientHeight);
            heroPlanet.material.uniforms.u_resolution.value.set(heroCanvas.clientWidth, heroCanvas.clientHeight);
        }
    };

    window.addEventListener('resize', handleHeroResize);
}

// Utility to load text from file
async function loadText(path) {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`Failed to load ${path}`);
    return res.text();
}

async function loadShadersList() {
    const list = await (await fetch("shaders/shaders.json")).json();
    list.forEach(name => {
        const opt = document.createElement("option");
        opt.value = name;
        opt.textContent = name.charAt(0).toUpperCase() + name.slice(1);
        selectS.appendChild(opt);
    });
    return list;
}

async function createMaterial(name) {
    if (!commonVertexShader) {
        commonVertexShader = await loadText("shaders/common.vert");
    }
    const frag = await loadText(`shaders/${name}.frag`);
    return new THREE.ShaderMaterial({
        vertexShader: commonVertexShader,
        fragmentShader: frag,
        uniforms: {
            u_time: { value: 1.0 },
            u_resolution: { value: new THREE.Vector2(canvas.clientWidth, canvas.clientHeight) }
        }
    });
}

async function init() {
    // Initialize hero background first
    initHeroBackground();

    // Initialize shader playground if canvas exists
    if (!canvas) return;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(70, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);

    const geometry = new THREE.SphereGeometry(1, 64, 64);
    currentMaterial = await createMaterial("default");
    mesh = new THREE.Mesh(geometry, currentMaterial);
    scene.add(mesh);

    // Populate dropdown
    const names = await loadShadersList();
    if (selectS) {
        selectS.value = "default";
        selectS.addEventListener("change", async () => {
            const newMat = await createMaterial(selectS.value);
            mesh.material.dispose();
            mesh.material = newMat;
            currentMaterial = newMat;
        });
    }

    // Add Light
    const light = new THREE.DirectionalLight(0xff00ff, 1);
    light.position.set(10, 20, 10);
    scene.add(light);

    camera.position.set(0, 0, 3);
    camera.lookAt(0, 0, 0);

    animate();
}

function animate(time) {
    const timeInSeconds = time * 0.001;

    // Animate hero background
    if (heroPlanet && heroPlanet.material.uniforms) {
        heroPlanet.material.uniforms.u_time.value = timeInSeconds;
        heroPlanet.rotation.y = timeInSeconds * 0.1; // Planet rotation
    }

    if (heroAtmosphere && heroAtmosphere.material.uniforms) {
        heroAtmosphere.material.uniforms.u_time.value = timeInSeconds;
        heroAtmosphere.rotation.y = timeInSeconds * 0.15; // Slightly faster atmosphere
    }

    // Animate orbiting moons
    if (heroMoons && heroPlanet) {
        heroMoons.forEach(moon => {
            moon.userData.angle += moon.userData.orbitSpeed * 0.01;
            moon.position.x = heroPlanet.position.x + Math.cos(moon.userData.angle) * moon.userData.orbitRadius;
            moon.position.z = heroPlanet.position.z + Math.sin(moon.userData.angle) * moon.userData.orbitRadius;
            moon.position.y = heroPlanet.position.y + Math.sin(moon.userData.angle * 2) * 0.5;
        });
    }

    // Slowly rotate stars
    if (heroStars) {
        heroStars.rotation.y = timeInSeconds * 0.01;
    }

    if (heroRenderer && heroScene && heroCamera) {
        heroRenderer.render(heroScene, heroCamera);
    }

    // Animate shader playground if active
    if (currentMaterial && currentMaterial.uniforms) {
        currentMaterial.uniforms.u_time.value = timeInSeconds;
    }
    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }

    requestAnimationFrame(animate);
}

// Add smooth scrolling for navigation
document.addEventListener('DOMContentLoaded', () => {
    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    let lastScrollY = window.scrollY;

    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;

        if (currentScrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Optional: Hide navbar on scroll down, show on scroll up
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
            navbar.style.transform = 'translateY(-100%)';
        } else {
            navbar.style.transform = 'translateY(0)';
        }

        lastScrollY = currentScrollY;
    });

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const navbarHeight = navbar.offsetHeight;
                const targetPosition = target.offsetTop - navbarHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Initialize everything
    init().catch(console.error);
});
