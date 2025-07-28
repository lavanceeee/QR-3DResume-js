// 全局变量
let scene, camera, renderer, controls;
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
    } else {
        console.error("无法找到 #three-container 元素！");
        document.body.appendChild(renderer.domElement); // 作为备用方案，直接添加到body
    }
    
    // 添加光源
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(1, 1, 1);
    scene.add(light);
    
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);
    
    // 添加轨道控制器，用于调试
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    
    // 加载3D模型
    loadModel();
}

// 加载GLTF模型
function loadModel() {
    const loader = new THREE.GLTFLoader();
    
    // 使用本地的牛油果模型
    const modelUrl = './scripts/show3DInfo/avacado/scene.gltf';
    
    loader.load(modelUrl, function(gltf) {
        gltfModel = gltf.scene;
        gltfModel.scale.set(1, 1, 1); // 初始大小设为1
        gltfModel.visible = false; // 初始隐藏
        
        scene.add(gltfModel);
        console.log('3D牛油果模型加载成功');
    }, undefined, function(error) {
        console.error('加载3D牛油果模型失败:', error);
    });
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
    
    controls.update(); // 更新控制器

    // 如果模型可见，添加一些动画效果
    if (gltfModel && gltfModel.visible) {
        gltfModel.rotation.y += 0.01;
    }
    
    renderer.render(scene, camera);
}

// 当检测到二维码时显示模型
function onQRCodeDetected(code) {
    if (!gltfModel) return;

    // 计算二维码的对角线长度作为尺寸参考
    const qrWidth = Math.abs(code.location.topRightCorner.x - code.location.topLeftCorner.x);
    const qrHeight = Math.abs(code.location.bottomLeftCorner.y - code.location.topLeftCorner.y);
    const qrSize = Math.sqrt(qrWidth * qrWidth + qrHeight * qrHeight);

    // 根据二维码大小动态调整模型缩放
    const scaleFactor = qrSize / 250; // 250是一个基准值，可以微调
    gltfModel.scale.set(scaleFactor, scaleFactor, scaleFactor);

    // 如果是第一次检测到，则显示模型
    if (!modelShown) {
        gltfModel.visible = true;
        modelShown = true;
        console.log('显示3D模型');
    }
}