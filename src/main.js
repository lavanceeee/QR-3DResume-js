window.onload = function () {
    // 初始化Three.js
    initThree();
    
    // 启动摄像头并开始二维码检测
    startCamera('camera', 'qr-canvas');
    
    // 添加窗口大小变化监听
    window.addEventListener('resize', onWindowResize);
    
    // 开始动画循环
    animate();
} 