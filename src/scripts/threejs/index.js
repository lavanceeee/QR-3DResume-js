import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

let scene, camera, renderer, controls, gltfModel, mixer;

function initThree(centerX, centerY) {
    const container = document.getElementById('three-container');
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 5);
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

    //控制器
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    loadModel(centerX, centerY);
}

function loadModel(centerX, centerY) {
    const loader = new GLTFLoader();
    const model_path = "/src/scripts/threejs/models/avacado/scene.gltf";

    loader.load(model_path, (gltf) => {
        console.log("模型加载成功");
        gltfModel = gltf.scene;
        gltfModel.scale.set(0.006, 0.006, 0.006);

        //位置
        // 将像素坐标转换为标准化设备坐标（NDC）
        const normalizedX = (centerX / window.innerWidth) * 2 - 1;
        const normalizedY = -(centerY / window.innerHeight) * 2 + 1;
        
        // 设置模型位置，调整缩放因子以适应视图
        gltfModel.position.set(normalizedX * 5, normalizedY * 5, 0);

        //旋转
        gltfModel.rotation.y = -Math.PI /2;

        //动画
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