import * as THREE from "three";

let scene, camera, renderer, mesh, currentMaterial;
let heroScene, heroCamera, heroRenderer, heroPlanet, heroAtmosphere, heroStars, heroMoons;
const canvas = document.getElementById("shaderCanvas");
const heroCanvas = document.getElementById("bg-canvas");
const selectS = document.getElementById("shaderSelect");
const selectV = document.getElementById("vertexSelect");
const selectM = document.getElementById("meshSelect");
const selectE = document.getElementById("experienceSelect");
const resetViewBtn = document.getElementById("resetViewBtn");
const fullscreenBtn = document.getElementById("fullscreenBtn");
const infoBtn = document.getElementById("infoBtn");

// Store loaded resources
let experiences = [];
let meshes = [];
let currentExperience = null;

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

// Load shader lists from new structured files
async function loadShadersConfig() {
    try {
        const config = await (await fetch("shaders/shaders.json")).json();
        return config;
    } catch (error) {
        console.error("Failed to load shader configuration:", error);
        return {
            fragmentShaders: [],
            vertexShaders: [],
            meshes: [],
            experiences: []
        };
    }
}

// Load fragment shaders
async function loadFragmentShaders(fragmentList) {
    if (selectS) {
        selectS.innerHTML = ''; // Clear existing options
        fragmentList.forEach(name => {
            const opt = document.createElement("option");
            opt.value = name;
            opt.textContent = name.charAt(0).toUpperCase() + name.slice(1);
            selectS.appendChild(opt);
        });
    }
    return fragmentList;
}

// Load vertex shaders
async function loadVertexShaders(vertexList) {
    if (selectV) {
        selectV.innerHTML = ''; // Clear existing options
        vertexList.forEach(name => {
            const opt = document.createElement("option");
            opt.value = name;
            opt.textContent = name.charAt(0).toUpperCase() + name.slice(1);
            selectV.appendChild(opt);
        });
    }
    return vertexList;
}

// Load meshes
async function loadMeshes(meshList) {
    meshes = meshList;
    if (selectM) {
        selectM.innerHTML = ''; // Clear existing options
        meshList.forEach(mesh => {
            const opt = document.createElement("option");
            opt.value = mesh.id;
            opt.textContent = mesh.name;
            selectM.appendChild(opt);
        });
    }
    return meshList;
}

// Load experiences
async function loadExperiences(experienceList) {
    experiences = experienceList;
    if (selectE) {
        selectE.innerHTML = ''; // Clear existing options
        experienceList.forEach(exp => {
            const opt = document.createElement("option");
            opt.value = exp.id;
            opt.textContent = exp.name;
            selectE.appendChild(opt);
        });
    }
    return experienceList;
}

// Create a mesh based on configuration
function createMesh(meshId) {
    const meshConfig = meshes.find(m => m.id === meshId);
    if (!meshConfig) return new THREE.SphereGeometry(1, 32, 32); // Default fallback
    
    // Create geometry based on configuration
    const geometryType = meshConfig.geometry;
    const params = meshConfig.parameters || [];
    
    let geometry;
    switch(geometryType) {
        case "SphereGeometry":
            geometry = new THREE.SphereGeometry(...params);
            break;
        case "BoxGeometry":
            geometry = new THREE.BoxGeometry(...params);
            break;
        case "TorusGeometry":
            geometry = new THREE.TorusGeometry(...params);
            break;
        case "TorusKnotGeometry":
            geometry = new THREE.TorusKnotGeometry(...params);
            break;
        case "PlaneGeometry":
            geometry = new THREE.PlaneGeometry(...params);
            break;
        case "ConeGeometry":
            geometry = new THREE.ConeGeometry(...params);
            break;
        case "CylinderGeometry":
            geometry = new THREE.CylinderGeometry(...params);
            break;
        case "OctahedronGeometry":
            geometry = new THREE.OctahedronGeometry(...params);
            break;
        case "IcosahedronGeometry":
            geometry = new THREE.IcosahedronGeometry(...params);
            break;
        default:
            geometry = new THREE.SphereGeometry(1, 32, 32);
    }
    
    return geometry;
}

// Create a material with the specified shaders
async function createMaterial(fragmentShader, vertexShader) {
    const fragShaderText = await loadText(`shaders/${fragmentShader}`);
    const vertShaderText = await loadText(`shaders/${vertexShader}`);
    
    return new THREE.ShaderMaterial({
        vertexShader: vertShaderText,
        fragmentShader: fragShaderText,
        uniforms: {
            u_time: { value: 1.0 },
            u_resolution: { value: new THREE.Vector2(canvas.clientWidth, canvas.clientHeight) }
        },
        side: THREE.DoubleSide // Ensure both sides are visible
    });
}

// Load an experience by ID
async function loadExperience(experienceId) {
    const experience = experiences.find(e => e.id === experienceId);
    if (!experience) {
        console.error(`Experience ${experienceId} not found`);
        return;
    }
    
    currentExperience = experience;
    
    // Update UI to reflect the current experience
    if (selectS) selectS.value = experience.fragmentShader.split('/').pop().replace('.frag', '');
    if (selectV) selectV.value = experience.vertexShader.split('/').pop().replace('.vert', '');
    if (selectM) selectM.value = experience.defaultMesh;
    
    // Update description
    const descriptionElement = document.getElementById('experienceDescription');
    if (descriptionElement && experience.description) {
        descriptionElement.textContent = experience.description;
    }
    
    // Create material with the specified shaders
    const material = await createMaterial(experience.fragmentShader, experience.vertexShader);
    
    // Create mesh with the default geometry
    const geometry = createMesh(experience.defaultMesh);
    
    // Update the scene
    updateScene(geometry, material);
}

// Update the scene with new geometry and material
function updateScene(geometry, material) {
    if (mesh) {
        // Clean up previous resources
        scene.remove(mesh);
        if (mesh.geometry) mesh.geometry.dispose();
        if (mesh.material) mesh.material.dispose();
    }
    
    // Create new mesh
    mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    currentMaterial = material;
    
    // Reset camera position for better viewing
    camera.position.set(0, 0, 3);
    camera.lookAt(0, 0, 0);
}

// Create custom material from selected shaders
async function createCustomMaterial() {
    const fragmentPath = `fragment/${selectS.value}.frag`;
    const vertexPath = `vertex/${selectV.value}.vert`;
    
    return await createMaterial(fragmentPath, vertexPath);
}

// Update mesh geometry
function updateMeshGeometry(meshId) {
    const geometry = createMesh(meshId);
    if (!geometry) return;
    
    // Keep the current material but update the geometry
    if (mesh && mesh.material) {
        const material = mesh.material;
        updateScene(geometry, material);
    }
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
    
    // Load all shader resources
    try {
        const config = await loadShadersConfig();
        await loadFragmentShaders(config.fragmentShaders);
        await loadVertexShaders(config.vertexShaders);
        await loadMeshes(config.meshes);
        await loadExperiences(config.experiences);
        
        // Set up event listeners for dropdowns
        if (selectE) {
            selectE.addEventListener("change", () => {
                loadExperience(selectE.value);
            });
        }
        
        if (selectS && selectV) {
            // For custom shader combinations
            const updateShaders = async () => {
                const material = await createCustomMaterial();
                if (mesh) {
                    mesh.material.dispose();
                    mesh.material = material;
                    currentMaterial = material;
                }
            };
            
            selectS.addEventListener("change", updateShaders);
            selectV.addEventListener("change", updateShaders);
        }
        
        if (selectM) {
            // For changing mesh type
            selectM.addEventListener("change", () => {
                updateMeshGeometry(selectM.value);
            });
        }
        
        // Setup control buttons
        if (resetViewBtn) {
            resetViewBtn.addEventListener("click", () => {
                camera.position.set(0, 0, 3);
                camera.lookAt(0, 0, 0);
            });
        }
        
        if (fullscreenBtn) {
            fullscreenBtn.addEventListener("click", () => {
                if (canvas.requestFullscreen) {
                    canvas.requestFullscreen();
                } else if (canvas.webkitRequestFullscreen) {
                    canvas.webkitRequestFullscreen();
                }
            });
        }
        
        if (infoBtn) {
            infoBtn.addEventListener("click", () => {
                const fragmentName = selectS.value;
                const vertexName = selectV.value;
                alert(`Current Shader Information:
Fragment Shader: ${fragmentName}
Vertex Shader: ${vertexName}
Uniforms: u_time, u_resolution`);
            });
        }

        // Load default experience or create default setup
        if (experiences.length > 0) {
            await loadExperience(experiences[0].id);
        } else {
            // Fallback to simple default setup
            const geometry = new THREE.SphereGeometry(1, 64, 64);
            const fragmentPath = "fragment/rainbow.frag";
            const vertexPath = "vertex/standard.vert";
            const material = await createMaterial(fragmentPath, vertexPath);
            updateScene(geometry, material);
        }
    } catch (error) {
        console.error("Failed to initialize shader playground:", error);
    }

    // Add Light
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(10, 20, 10);
    scene.add(light);
    
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

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
