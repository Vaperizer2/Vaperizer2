import * as THREE from "three";

let scene, camera, renderer, mesh, currentMaterial;
const canvas = document.getElementById("shaderCanvas");
const selectS = document.getElementById("shaderSelect");
const selectV = document.getElementById("vertexSelect");
const selectM = document.getElementById("meshSelect");
let commonVertexShader;

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
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(70, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);

    const geometry = new THREE.SphereGeometry(1, 64, 64);
    currentMaterial = await createMaterial("default");
    mesh = new THREE.Mesh(geometry, currentMaterial);
    scene.add(mesh);
    // camera.position.z = 3;

    // Populate dropdown
    const names = await loadShadersList();
    selectS.value = "default";

    selectS.addEventListener("change", async () => {
        const newMat = await createMaterial(selectS.value);
        mesh.material.dispose();
        mesh.material = newMat;
        currentMaterial = newMat;
    });

    // Add Light
    const light = new THREE.DirectionalLight(0xff00ff, 1);
    light.position.set(10, 20, 10);
    scene.add(light);

    camera.position.set(0, 0, 3);
    camera.lookAt(0, 0, 0);

    animate();
}

function animate(time) {
    currentMaterial.uniforms.u_time.value = time * 0.001;
    // mesh.rotation.y = time * 0.0002;
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

init().catch(console.error);
