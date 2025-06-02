import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const scene = new THREE.Scene();

//THREE.PerspectiveCamera( fov angle, aspect ratio, near depth, far depth );
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
camera.position.set(0, 5, 10);
controls.target.set(0, 5, 0);

// Rendering 3D axis
const createAxisLine = (color, start, end) => {
    const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);
    const material = new THREE.LineBasicMaterial({ color: color });
    return new THREE.Line(geometry, material);
};
const xAxis = createAxisLine(0xff0000, new THREE.Vector3(0, 0, 0), new THREE.Vector3(3, 0, 0)); // Red
const yAxis = createAxisLine(0x00ff00, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 3, 0)); // Green
const zAxis = createAxisLine(0x0000ff, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 3)); // Blue
scene.add(xAxis);
scene.add(yAxis);
scene.add(zAxis);

// ***** Assignment 2 *****
// Setting up the lights
const pointLight = new THREE.PointLight(0xffffff, 100, 100);
pointLight.position.set(5, 5, 5); // Position the light
scene.add(pointLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(0.5, .0, 1.0).normalize();
scene.add(directionalLight);

const ambientLight = new THREE.AmbientLight(0x505050);  // Soft white light
scene.add(ambientLight);

const phong_material = new THREE.MeshPhongMaterial({
    color: 0x00ff00, // Green color
    shininess: 100   // Shininess of the material
});

const l = 0.5;

// Exercise 1: Define positions, normals, and indices for all 6 faces of the cube
const positions = new Float32Array([
    // Front face 
    -l, -l,  l, // 0
     l, -l,  l, // 1
     l,  l,  l, // 2
    -l,  l,  l, // 3
    
    // Back face 
    -l, -l, -l, // 4
     l, -l, -l, // 5
     l,  l, -l, // 6
    -l,  l, -l, // 7
    
    // Left face
    -l, -l, -l, // 8
    -l, -l,  l, // 9
    -l,  l,  l, // 10
    -l,  l, -l, // 11
    
    // Right face 
     l, -l, -l, // 12
     l, -l,  l, // 13
     l,  l,  l, // 14
     l,  l, -l, // 15
    
    // Top face 
    -l,  l, -l, // 16
    -l,  l,  l, // 17
     l,  l,  l, // 18
     l,  l, -l, // 19
    
    // Bottom face 
    -l, -l, -l, // 20
    -l, -l,  l, // 21
     l, -l,  l, // 22
     l, -l, -l  // 23
]);

const normals = new Float32Array([
    // Front face 
    0, 0, 1,
    0, 0, 1,
    0, 0, 1,
    0, 0, 1,
    
    // Back face
    0, 0, -1,
    0, 0, -1,
    0, 0, -1,
    0, 0, -1,
    
    // Left face 
    -1, 0, 0,
    -1, 0, 0,
    -1, 0, 0,
    -1, 0, 0,
    
    // Right face 
    1, 0, 0,
    1, 0, 0,
    1, 0, 0,
    1, 0, 0,
    
    // Top face 
    0, 1, 0,
    0, 1, 0,
    0, 1, 0,
    0, 1, 0,
    
    // Bottom face 
    0, -1, 0,
    0, -1, 0,
    0, -1, 0,
    0, -1, 0
]);

const indices = [
    // Front face
    0, 1, 2,
    0, 2, 3,
    
    // Back face
    4, 6, 5,
    4, 7, 6,
    
    // Left face
    8, 9, 10,
    8, 10, 11,
    
    // Right face
    12, 14, 13,
    12, 15, 14,
    
    // Top face
    16, 17, 18,
    16, 18, 19,
    
    // Bottom face
    20, 22, 21,
    20, 23, 22
];

// Creating buffer geometry for cube
const custom_cube_geometry = new THREE.BufferGeometry();
custom_cube_geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
custom_cube_geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
custom_cube_geometry.setIndex(new THREE.BufferAttribute(new Uint16Array(indices), 1));

// Exercise 5: Create wireframe geometry
const wireframe_vertices = new Float32Array([
    // Front face
    -l, -l, l,  l, -l, l,
    l, -l, l,   l, l, l,
    l, l, l,    -l, l, l,
    -l, l, l,   -l, -l, l,
    
    // Back face
    -l, -l, -l, l, -l, -l,
    l, -l, -l,  l, l, -l,
    l, l, -l,   -l, l, -l,
    -l, l, -l,  -l, -l, -l,
    
    // Connect front to back
    -l, -l, -l, -l, -l, l,
    l, -l, -l,  l, -l, l,
    l, l, -l,   l, l, l,
    -l, l, -l,  -l, l, l
]);

const wireframe_geometry = new THREE.BufferGeometry();
wireframe_geometry.setAttribute('position', new THREE.BufferAttribute(wireframe_vertices, 3));

// Transformation matrices functions
function translationMatrix(tx, ty, tz) {
    return new THREE.Matrix4().set(
        1, 0, 0, tx,
        0, 1, 0, ty,
        0, 0, 1, tz,
        0, 0, 0, 1
    );
}

// Exercise 2: Rotation matrix around Z axis
function rotationMatrixZ(theta) {
    return new THREE.Matrix4().set(
        Math.cos(theta), -Math.sin(theta), 0, 0,
        Math.sin(theta), Math.cos(theta), 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    );
}

// Exercise 3: Scaling matrix
function scalingMatrix(sx, sy, sz) {
    return new THREE.Matrix4().set(
        sx, 0, 0, 0,
        0, sy, 0, 0,
        0, 0, sz, 0,
        0, 0, 0, 1
    );
}

// Create arrays for both solid and wireframe cubes
let cubes = [];
let cubes_wireframe = [];
const numCubes = 7;

// Initialize the cubes for both solid and wireframe
for (let i = 0; i < numCubes; i++) {
    // Solid 
    let cube = new THREE.Mesh(custom_cube_geometry, phong_material.clone());
    cube.matrixAutoUpdate = false;
    cubes.push(cube);
    scene.add(cube);
    
    // Wireframe 
    let wireframe = new THREE.LineSegments(wireframe_geometry, new THREE.LineBasicMaterial({ color: 0xffffff }));
    wireframe.matrixAutoUpdate = false;
    wireframe.visible = false; // Hide wireframes initially
    cubes_wireframe.push(wireframe);
    scene.add(wireframe);
}

// Animation params
let animation_time = 0;
let delta_animation_time;
const clock = new THREE.Clock();
const MAX_ANGLE = 10 * Math.PI / 180; // 10 degs in radians
const T = 3; // Oscillation period (s)
let still = false;
let wireframe_mode = false;

// Keypress
window.addEventListener('keydown', onKeyPress);
function onKeyPress(event) {
    switch (event.key) {
        case 's':
            still = !still;
            break;
        case 'w':
            wireframe_mode = !wireframe_mode;
            for (let i = 0; i < numCubes; i++) {
                cubes[i].visible = !wireframe_mode;
                cubes_wireframe[i].visible = wireframe_mode;
            }
            break;
        default:
            console.log(`Key ${event.key} pressed`);
    }
}

function animate() {
    requestAnimationFrame(animate);
    
    delta_animation_time = clock.getDelta();
    if (!still) {
        animation_time += delta_animation_time;
    } else {
        animation_time = T / 4;
    }
    
    const rotation_angle = MAX_ANGLE * Math.abs(Math.sin(2 * Math.PI * animation_time / T));
    const scale = scalingMatrix(1, 1.5, 1);

    // Identity
    let model_transformation = new THREE.Matrix4();

    for (let i = 0; i < numCubes; i++) {
        if (i === 0) {
            // First cube scale only
            model_transformation.copy(scale);
        } else {
            // Move to bottom left of previous cube
            let temp = new THREE.Matrix4();
            temp.multiplyMatrices(translationMatrix(l, l * 1.5, 0), model_transformation);

            // Rotate
            let temp2 = new THREE.Matrix4();
            temp2.multiplyMatrices(rotationMatrixZ(rotation_angle), temp);

            // Move to top left of current cube
            model_transformation.multiplyMatrices(translationMatrix(-l, l * 1.5, 0), temp2);
        }

        cubes[i].matrix.copy(model_transformation);
        cubes_wireframe[i].matrix.copy(model_transformation);
    }
    
    renderer.render(scene, camera);
    controls.update();
}

// Start animation
renderer.setAnimationLoop(animate); 