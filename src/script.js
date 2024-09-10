import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import domtoimage from 'dom-to-image';

// Variables
let box = null;
let mixer = null;
let action = null;
const loader = new GLTFLoader();

// Load texture
// const textureLoader = new THREE.TextureLoader();
// const texture = await textureLoader.load('Plan33.png');
// texture.minFilter = THREE.LinearFilter;
// texture.magFilter = THREE.LinearFilter;
// texture.wrapS = THREE.RepeatWrapping;
// texture.wrapT = THREE.RepeatWrapping;
// const material = new THREE.MeshBasicMaterial({ map: texture });

// Scene setup
const canvas = document.querySelector('canvas.webgl');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xcccccc);

const gridHelper = new THREE.GridHelper(10, 15);
scene.add(gridHelper);

const light = new THREE.AmbientLight(0xffffff, 2);
scene.add(light);

// Camera and controls
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.set(1, 1, 1);
scene.add(camera);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

// Renderer setup
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
renderer.outputEncoding = THREE.sRGBEncoding;

// Animate function
const clock = new THREE.Clock();

const tick = () => {
    const deltaTime = clock.getDelta();

    controls.update();

    if (mixer) {
        mixer.update(deltaTime);
    }

    renderer.render(scene, camera);

    window.requestAnimationFrame(tick);
};

tick();

// Load model function
const loadModel = (path) => {
    if (box) {
        scene.remove(box); // Remove the current model if it exists
        box = null;
        mixer = null;
        action = null;
    }

    loader.load(path, (gltf) => {
        box = gltf.scene;
        box.position.y += 0.1; 
        scene.add(box);
        box.traverse((node) => {
            if (node.isMesh) {
                // node.material.map = texture; // Assigner la texture
                // node.material.needsUpdate = true; // Assurer que les modifications sont prises en compte
            }
        });
        if (gltf.animations && gltf.animations.length > 0) {
            mixer = new THREE.AnimationMixer(box);
            action = mixer.clipAction(gltf.animations[0]);
        } else {
            console.warn("No animations found in the loaded model.");
        }
    });
};

// Button functionality
document.getElementById('loadBox1Button').addEventListener('click', () => {
    loadModel('../box.glb');
});

document.getElementById('loadBox3Button').addEventListener('click', () => {
    loadModel('../box3.glb');
});

window.addEventListener('resize', () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});
// Button functionality
const playButton = document.getElementById('playAnimationButton');
playButton.addEventListener('click', () => {
    if (mixer && action) {
        if (!action.isRunning()) {  // Check if the animation is not already playing
            action.reset().play();  // Play the animation from the beginning
            action.clampWhenFinished = true;  // Clamp to the last frame when finished
            action.setLoop(THREE.LoopOnce);  // Set animation to play only once
        }
    }
});