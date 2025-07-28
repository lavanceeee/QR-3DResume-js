// 全局变量
let scene, camera, renderer;
let gltfModel;
let modelShown = false; // 标记模型是否已经显示过

// 初始化Three.js场景
function initThree() {
    // 创建场景
    scene = new THREE.Scene();
    
    // 创建相机
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
    
    // 创建渲染器
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0); // 透明背景
    
    // 添加到容器
    const container = document.getElementById('three-container');
    if (container) {
        container.appendChild(renderer.domElement);
    }
    
    // 添加光源
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(1, 1, 1);
    scene.add(light);
    
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);
    
    // 加载3D模型
    loadModel();
}

// 加载GLTF模型
function loadModel() {
    // 创建一个简单的立方体作为默认模型
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    gltfModel = new THREE.Mesh(geometry, material);
    gltfModel.visible = false; // 初始隐藏
    scene.add(gltfModel);
    
    // 如果有GLTF加载器，可以加载真实模型
    if (typeof THREE.GLTFLoader !== 'undefined') {
        const loader = new THREE.GLTFLoader();
        
        // 使用本地模型
        const modelUrl = './scripts/show3DInfo/avacado/scene.gltf';
        
        loader.load(modelUrl, function(gltf) {
            scene.remove(gltfModel); // 移除默认立方体
            
            gltfModel = gltf.scene;
            gltfModel.scale.set(0.5, 0.5, 0.5); // 缩放模型
            gltfModel.position.set(0, 0, 0); // 确保模型在相机视野内
            gltfModel.visible = false; // 初始隐藏
            
            scene.add(gltfModel);
            console.log('3D模型加载成功');
        }, 
        // 进度回调
        function(xhr) {
            console.log('模型加载进度: ' + (xhr.loaded / xhr.total * 100) + '%');
        }, 
        // 错误回调
        function(error) {
            console.error('加载3D模型失败:', error);
            // 显示更详细的错误信息
            console.log('模型路径:', modelUrl);
            console.log('错误详情:', error.target);
        });
    }
}

// 处理窗口大小变化
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// 动画循环
function animate() {
    requestAnimationFrame(animate);
    
    // 如果模型可见，添加一些动画效果
    if (gltfModel && gltfModel.visible) {
        gltfModel.rotation.y += 0.01;
    }
    
    renderer.render(scene, camera);
}

// 当检测到二维码时显示模型
function onQRCodeDetected(code) {
    // 如果模型已经显示过，则不再处理
    if (modelShown) return;
    
    // 如果模型不存在，也不处理
    if (!gltfModel) return;
    
    // 显示模型并标记为已显示
    gltfModel.visible = true;
    modelShown = true;
    console.log('显示3D模型 - 将保持显示状态');
    
    // 确保模型在视野中心
    gltfModel.position.set(0, 0, 0);
}