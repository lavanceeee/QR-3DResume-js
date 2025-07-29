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