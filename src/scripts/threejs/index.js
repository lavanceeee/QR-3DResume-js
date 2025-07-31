import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

let scene, camera, renderer, controls, gltfModel, mixer;

function initThree(centerX, centerY) {
    const container = document.getElementById('three-container');
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 7);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    //鼠标控制器
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    loadModel(centerX, centerY);
}

function loadModel(centerX, centerY) {
    const loader = new GLTFLoader();
    const model_path = "./scripts/threejs/models/avacado/scene.gltf";

    loader.load(model_path, (gltf) => {
        console.log("模型加载成功");
        gltfModel = gltf.scene;
        gltfModel.scale.set(0.0006, 0.0006, 0.0006);

        // 1. 用 unproject 将屏幕坐标(centerX, centerY)映射到3D世界坐标
        const ndcX = (centerX / window.innerWidth) * 2 - 1;
        const ndcY = -(centerY / window.innerHeight) * 2 + 1;
        // 这里z取0表示在相机前方的近平面，可以根据实际需要调整深度
        const vector = new THREE.Vector3(ndcX, ndcY, 0.5); // 0.5为深度，0近平面，1远平面
        vector.unproject(camera);
        gltfModel.position.copy(vector);

        // 2. 设置 OrbitControls 的 target 指向模型
        controls.target.copy(gltfModel.position);
        controls.update();

        // 3. camera.lookAt 指向模型
        camera.lookAt(gltfModel.position);

        // 4. 动画
        mixer = new THREE.AnimationMixer(gltfModel);
        if (gltf.animations && gltf.animations.length > 0) {
            gltf.animations.forEach((clip) => {
                const action = mixer.clipAction(clip);
                action.play();
            });
        }
        scene.add(gltfModel);
    }, undefined, (error) => {
        console.error('模型加载失败:', error);
    });
}

// 导出窗口尺寸调整函数
function onWindowResize() {
    if (!camera || !renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// 导出动画循环函数
function animate() {
    requestAnimationFrame(animate);
    if (controls) controls.update();

    //更新动画
    if (mixer) {
        mixer.update(0.020);
    }
    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
}

window.initThree = initThree;
window.animate = animate;