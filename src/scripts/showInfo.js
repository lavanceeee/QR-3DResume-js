export class LottieAnimation {
    constructor() {
        // 不需要初始化，直接使用
    }

    showAtPosition(x, y) {
        // 创建简单的挥手动画
        const element = document.createElement('div');
        element.innerHTML = '👋';
        element.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: ${y}px;
            font-size: 40px;
            pointer-events: none;
            z-index: 20;
            animation: bounce 1s ease-in-out;
        `;
        
        document.body.appendChild(element);
        
        setTimeout(() => {
            document.body.removeChild(element);
        }, 1000);
    }
}
