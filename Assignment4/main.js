import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 0, -8);

const renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);


class Texture_Rotate {
    vertexShader() {
        return `
        uniform sampler2D uTexture;
        varying vec2 vUv;
        varying vec3 vPosition;
        void main() {
            vUv = uv;
            vPosition = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
        }
        `;
    }

    fragmentShader() {
        return `
        uniform sampler2D uTexture;
        uniform float animation_time;
        varying vec2 vUv;
        varying vec3 vPosition;
        void main() {    
            // TODO: 2.c Rotate the texture map around the center of each face at a rate of 8 rpm.
            vec2 centered_uv = vUv - 0.5;
            float angle = -animation_time * 4.0 * 3.14159 / 15.0; // 8 rpm = 4π/15 rad/sec, negative for clockwise
            vec2 rotated_uv;
            rotated_uv.x = centered_uv.x * cos(angle) - centered_uv.y * sin(angle);
            rotated_uv.y = centered_uv.x * sin(angle) + centered_uv.y * cos(angle);
            rotated_uv += 0.5;
            rotated_uv = fract(rotated_uv);  // Ensure proper wrapping

            // TODO: 1.b Load the texture color from the texture map
            vec4 tex_color = texture2D(uTexture, rotated_uv);
            
            // TODO: 2.d add the outline of a black circle in the center of each texture that moves with the texture
            vec2 circle_uv = rotated_uv - 0.5;
            float dist = length(circle_uv);
            if (dist > 0.3 && dist < 0.4) {
                tex_color = vec4(0.0, 0.0, 0.0, 1.0);
            }

            gl_FragColor = tex_color;
        }
        `;
    }
}


class Texture_Scroll_X {
    vertexShader() {
        return `
        uniform sampler2D uTexture;
        varying vec2 vUv;
        varying vec3 vPosition;
        void main() {
            vUv = uv;
            vPosition = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
        }
        `;
    }

    fragmentShader() {
        return `
        uniform sampler2D uTexture;
        uniform float animation_time;
        varying vec2 vUv;
        varying vec3 vPosition;
        void main() {
            // TODO: 2.a Shrink the texuture by 50% so that the texture is repeated twice in each direction
            vec2 scaled_uv = vUv * 2.0;

            // TODO: 2.b Translate the texture varying the s texture coordinate by 4 texture units per second, 
            vec2 scrolled_uv = scaled_uv;
            scrolled_uv.x -= animation_time * 4.0;  // Negative for left to right
            scrolled_uv = fract(scrolled_uv);  // Ensure proper wrapping

            // TODO: 1.b Load the texture color from the texture map
            vec4 tex_color = texture2D(uTexture, scrolled_uv);
            
            // TODO: 2.d add the outline of a black circle in the center of each texture that moves with the texture
            vec2 circle_uv = scrolled_uv - vec2(0.5, 0.5);
            float dist = length(circle_uv);
            if (dist > 0.3 && dist < 0.4) {
                tex_color = vec4(0.0, 0.0, 0.0, 1.0);
            }

            gl_FragColor = tex_color;
        }
        `;
    }
}

let animation_time = 0.0;
let isRotating = false;
let rotationStartTime = 0;
let totalRotationX = 0;
let totalRotationY = 0;
let lastRotationX = 0;
let lastRotationY = 0;

const cube1_geometry = new THREE.BoxGeometry(2, 2, 2);

// TODO: 1.a Load texture map 
const cube1_texture = new THREE.TextureLoader().load('assets/stars.png');

// TODO: 1.c Apply Texture Filtering Techniques to Cube 1
// Nearest Neighbor Texture Filtering
cube1_texture.minFilter = THREE.NearestFilter;
cube1_texture.magFilter = THREE.NearestFilter;

// TODO: 2.a Enable texture repeat wrapping for Cube 1
cube1_texture.wrapS = THREE.RepeatWrapping;
cube1_texture.wrapT = THREE.RepeatWrapping;

const cube1_uniforms = {
    uTexture: { value: cube1_texture },
    animation_time: { value: animation_time }
};
const cube1_shader = new Texture_Rotate();
const cube1_material = new THREE.ShaderMaterial({
    uniforms: cube1_uniforms,
    vertexShader: cube1_shader.vertexShader(),
    fragmentShader: cube1_shader.fragmentShader(),
});

const cube1_mesh = new THREE.Mesh(cube1_geometry, cube1_material);
cube1_mesh.position.set(2, 0, 0);
cube1_mesh.rotation.order = 'XYZ';  // Set rotation order to ensure X rotation works correctly
scene.add(cube1_mesh);

const cube2_geometry = new THREE.BoxGeometry(2, 2, 2);

// TODO: 1.a Load texture map 
const cube2_texture = new THREE.TextureLoader().load('assets/earth.gif');

// TODO: 1.c Apply Texture Filtering Techniques to Cube 2
// Linear Mipmapping Texture Filtering
cube2_texture.minFilter = THREE.LinearMipmapLinearFilter;
cube2_texture.magFilter = THREE.LinearFilter;

// TODO: 2.a Enable texture repeat wrapping for Cube 2
cube2_texture.wrapS = THREE.RepeatWrapping;
cube2_texture.wrapT = THREE.RepeatWrapping;

const cube2_uniforms = {
    uTexture: { value: cube2_texture },
    animation_time: { value: animation_time }
};
const cube2_shader = new Texture_Scroll_X();
const cube2_material = new THREE.ShaderMaterial({
    uniforms: cube2_uniforms,
    vertexShader: cube2_shader.vertexShader(),
    fragmentShader: cube2_shader.fragmentShader(),
});

const cube2_mesh = new THREE.Mesh(cube2_geometry, cube2_material);
cube2_mesh.position.set(-2, 0, 0);
cube2_mesh.rotation.order = 'XYZ';  // Set rotation order to ensure Y rotation works correctly
scene.add(cube2_mesh);

const clock = new THREE.Clock();

function animate() {
    controls.update();

    // TODO: 2.b&2.c Update uniform values
    animation_time = clock.getElapsedTime();
    cube1_uniforms.animation_time.value = animation_time;
    cube2_uniforms.animation_time.value = animation_time;

    // TODO: 2.e Rotate the cubes if the key 'c' is pressed to start the animation
    if (isRotating) {
        const elapsed = animation_time - rotationStartTime;
        totalRotationX = lastRotationX - elapsed * Math.PI / 2;  // Negative for inverted rotation
        totalRotationY = lastRotationY + elapsed * 4 * Math.PI / 3;  // 40 rpm
    } else {
        lastRotationX = totalRotationX;
        lastRotationY = totalRotationY;
    }
    
    // Always apply the current rotation
    cube1_mesh.rotation.x = totalRotationX;
    cube2_mesh.rotation.y = totalRotationY;

    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

// TODO: 2.e Keyboard Event Listener
document.addEventListener('keydown', function(event) {
    if (event.key === 'c' || event.key === 'C') {
        isRotating = !isRotating;
        if (isRotating) {
            rotationStartTime = animation_time;
        }
    }
});