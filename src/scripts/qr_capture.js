//二维码位置标定
function  find_location(code, canvas) {
    const ctx = canvas.getContext('2d');

    const topRight = code.location.topRightCorner;
    const topLeft = code.location.topLeftCorner;
    const bottomRight = code.location.bottomRightCorner;
    const bottomLeft = code.location.bottomLeftCorner;

    if (topLeft && topRight && bottomLeft && bottomRight) {
        //标定二维码位置
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(topLeft.x, topLeft.y);
        ctx.lineTo(topRight.x, topRight.y);
        ctx.lineTo(bottomRight.x, bottomRight.y);
        ctx.lineTo(bottomLeft.x, bottomLeft.y);
        ctx.closePath();
        ctx.stroke();
    }    
}

function onQRCodeDetected(code) {
    const topLeft = code.location.topLeftCorner;
    const topRight = code.location.topRightCorner;
    const bottomRight = code.location.bottomRightCorner;
    const bottomLeft = code.location.bottomLeftCorner;

    // 计算二维码中心
    const centerX = (topLeft.x + topRight.x + bottomRight.x + bottomLeft.x) / 4;
    const centerY = (topLeft.y + topRight.y + bottomRight.y + bottomLeft.y) / 4;

    // 假设canvas和three.js渲染器尺寸一致
    // 将2D像素坐标映射到three.js世界坐标
    // 这里简单处理：将canvas中心映射到three.js (0,0,0)
    const canvas = document.getElementById('qr-canvas');
    const ndcX = (centerX / canvas.width) * 2 - 1; // 归一化到[-1,1]
    const ndcY = -((centerY / canvas.height) * 2 - 1); // 归一化到[-1,1]，注意Y轴方向

    // 使用three.js的unproject将2D点映射到3D空间
    const vector = new THREE.Vector3(ndcX, ndcY, 0.5); // z=0.5在摄像头前方
    vector.unproject(camera);

    // 设置模型位置
    if (gltfModel) {
        gltfModel.position.copy(vector);
    }
}