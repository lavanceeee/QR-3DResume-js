var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export class CameraService {
    constructor(videoElementId) {
        const video = document.getElementById(videoElementId);
        if (!video) {
            throw new Error(`未找到 ID 为 ${videoElementId} 的 <video> 元素`);
        }
        this.videoElement = video;
        this.configureVideoElement();
    }
    configureVideoElement() {
        this.videoElement.setAttribute('autoplay', '');
        this.videoElement.setAttribute('muted', '');
        this.videoElement.setAttribute('playsinline', '');
        this.videoElement.style.objectFit = 'cover';
    }
    startCamera() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const stream = yield navigator.mediaDevices.getUserMedia({ video: true });
                this.videoElement.srcObject = stream;
                return stream;
            }
            catch (err) {
                throw new Error('摄像头访问失败：' + err.message);
            }
        });
    }
    stopCamera() {
        const stream = this.videoElement.srcObject;
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            this.videoElement.srcObject = null;
        }
    }

    //开始检测二维码位置
    startQRDetection() {
        // 等待视频元数据加载完成
        if (this.videoElement.videoWidth === 0 || this.videoElement.videoHeight === 0) {
            this.videoElement.addEventListener('loadedmetadata', () => {
                this.startQRDetection();
            });
            return;
        }
        
        // 初始化覆盖层画布
        const overlay = document.getElementById('overlay');
        if (overlay) {
            overlay.width = this.videoElement.offsetWidth;
            overlay.height = this.videoElement.offsetHeight;
        }
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        // 设置画布尺寸
        canvas.width = this.videoElement.videoWidth;
        canvas.height = this.videoElement.videoHeight;
        
        const detectQR = () => {
            // 将视频帧绘制到画布
            context.drawImage(this.videoElement, 0, 0, canvas.width, canvas.height);
            
            // 获取图像数据
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            
            // 使用jsQR识别二维码
            const code = jsQR(imageData.data, imageData.width, imageData.height);
            
            if (code) {
                // 找到二维码，返回位置信息
                console.log('二维码内容:', code.data);
                console.log('二维码位置:', code.location);
                
                // 绘制二维码位置框
                this.drawQRCodeBox(code.location);
            } else {
                // 清除之前的绘制
                this.clearOverlay();
            }
            
            // 继续下一帧检测
            requestAnimationFrame(detectQR);
        };
        
        // 开始检测
        detectQR();

        // 处理窗口大小变化
        window.addEventListener('resize', () => {
            const overlay = document.getElementById('overlay');
            if (overlay) {
                overlay.width = this.videoElement.offsetWidth;
                overlay.height = this.videoElement.offsetHeight;
            }
        });
    }

    //绘制动效
    drawQRCodeBox(location) {
        const overlay = document.getElementById('overlay');
        if (!overlay) return;
        
        const ctx = overlay.getContext('2d');
        const video = this.videoElement;
        
        // 计算缩放比例（视频实际尺寸 vs 显示尺寸）
        const scaleX = overlay.width / video.videoWidth;
        const scaleY = overlay.height / video.videoHeight;
        
        // 清除画布
        ctx.clearRect(0, 0, overlay.width, overlay.height);
        
        // 设置绘制样式
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]); // 虚线效果
        
        // 绘制二维码边框
        ctx.beginPath();
        ctx.moveTo(location.topLeftCorner.x * scaleX, location.topLeftCorner.y * scaleY);
        ctx.lineTo(location.topRightCorner.x * scaleX, location.topRightCorner.y * scaleY);
        ctx.lineTo(location.bottomRightCorner.x * scaleX, location.bottomRightCorner.y * scaleY);
        ctx.lineTo(location.bottomLeftCorner.x * scaleX, location.bottomLeftCorner.y * scaleY);
        ctx.closePath();
        ctx.stroke();
        
        // 绘制四个角的标记
        const cornerSize = 10;
        ctx.setLineDash([]); // 实线
        ctx.lineWidth = 2;
        
        // 左上角
        ctx.beginPath();
        ctx.moveTo(location.topLeftCorner.x * scaleX, location.topLeftCorner.y * scaleY);
        ctx.lineTo(location.topLeftCorner.x * scaleX + cornerSize, location.topLeftCorner.y * scaleY);
        ctx.moveTo(location.topLeftCorner.x * scaleX, location.topLeftCorner.y * scaleY);
        ctx.lineTo(location.topLeftCorner.x * scaleX, location.topLeftCorner.y * scaleY + cornerSize);
        ctx.stroke();
        
        // 右上角
        ctx.beginPath();
        ctx.moveTo(location.topRightCorner.x * scaleX, location.topRightCorner.y * scaleY);
        ctx.lineTo(location.topRightCorner.x * scaleX - cornerSize, location.topRightCorner.y * scaleY);
        ctx.moveTo(location.topRightCorner.x * scaleX, location.topRightCorner.y * scaleY);
        ctx.lineTo(location.topRightCorner.x * scaleX, location.topRightCorner.y * scaleY + cornerSize);
        ctx.stroke();
        
        // 左下角
        ctx.beginPath();
        ctx.moveTo(location.bottomLeftCorner.x * scaleX, location.bottomLeftCorner.y * scaleY);
        ctx.lineTo(location.bottomLeftCorner.x * scaleX + cornerSize, location.bottomLeftCorner.y * scaleY);
        ctx.moveTo(location.bottomLeftCorner.x * scaleX, location.bottomLeftCorner.y * scaleY);
        ctx.lineTo(location.bottomLeftCorner.x * scaleX, location.bottomLeftCorner.y * scaleY - cornerSize);
        ctx.stroke();
        
        // 右下角
        ctx.beginPath();
        ctx.moveTo(location.bottomRightCorner.x * scaleX, location.bottomRightCorner.y * scaleY);
        ctx.lineTo(location.bottomRightCorner.x * scaleX - cornerSize, location.bottomRightCorner.y * scaleY);
        ctx.moveTo(location.bottomRightCorner.x * scaleX, location.bottomRightCorner.y * scaleY);
        ctx.lineTo(location.bottomRightCorner.x * scaleX, location.bottomRightCorner.y * scaleY - cornerSize);
        ctx.stroke();

        if (!this.threeAnimation) {
            import('./showInfo.js').then(module => {
                this.threeAnimation = new module.LottieAnimation();
            });
        }

        // 计算二维码中心位置（使用缩放后的坐标）
        const centerX = (location.topLeftCorner.x + location.topRightCorner.x + 
                        location.bottomLeftCorner.x + location.bottomRightCorner.x) / 4 * scaleX;
        const centerY = (location.topLeftCorner.y + location.topRightCorner.y + 
                        location.bottomLeftCorner.y + location.bottomRightCorner.y) / 4 * scaleY;

        // 显示3D小手
        if (this.threeAnimation) {
            this.threeAnimation.showAtPosition(centerX, centerY);
        }
    }

    clearOverlay() {
        const overlay = document.getElementById('overlay');
        if (!overlay) return;
        
        const ctx = overlay.getContext('2d');
        ctx.clearRect(0, 0, overlay.width, overlay.height);
    }
}
