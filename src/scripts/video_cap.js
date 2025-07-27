var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](e)); } catch (e) { reject(e); } }
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
                const constraints = {
                    video: {
                        facingMode: { ideal: 'environment' },
                        width: { ideal: 1280, min: 640 },
                        height: { ideal: 720, min: 480 },
                        frameRate: { ideal: 30, min: 15 },
                        focusMode: { ideal: 'continuous' }
                    }
                };
                
                const stream = yield navigator.mediaDevices.getUserMedia(constraints);
                this.videoElement.srcObject = stream;
                return stream;
            }
            catch (err) {
                try {
                    const fallbackConstraints = {
                        video: {
                            facingMode: { ideal: 'user' },
                            width: { ideal: 1280, min: 640 },
                            height: { ideal: 720, min: 480 },
                            frameRate: { ideal: 30, min: 15 },
                            focusMode: { ideal: 'continuous' }
                        }
                    };
                    
                    const stream = yield navigator.mediaDevices.getUserMedia(fallbackConstraints);
                    this.videoElement.srcObject = stream;
                    return stream;
                } catch (fallbackErr) {
                    throw new Error('摄像头访问失败：' + err.message);
                }
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

    startQRDetection() {
        if (this.videoElement.videoWidth === 0 || this.videoElement.videoHeight === 0) {
            this.videoElement.addEventListener('loadedmetadata', () => {
                this.startQRDetection();
            });
            return;
        }
        
        const overlay = document.getElementById('overlay');
        if (overlay) {
            overlay.width = this.videoElement.offsetWidth;
            overlay.height = this.videoElement.offsetHeight;
        }
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d', { willReadFrequently: true });
        
        const scale = 0.5;
        canvas.width = this.videoElement.videoWidth * scale;
        canvas.height = this.videoElement.videoHeight * scale;
        
        let lastDetectionTime = 0;
        const detectionInterval = 100;
        
        const detectQR = () => {
            const now = Date.now();
            
            if (now - lastDetectionTime < detectionInterval) {
                requestAnimationFrame(detectQR);
                return;
            }
            
            lastDetectionTime = now;
            
            context.drawImage(this.videoElement, 0, 0, canvas.width, canvas.height);
            
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
                inversionAttempts: "dontInvert",
            });
            
            if (code) {
                const scaledLocation = {
                    topLeftCorner: {
                        x: code.location.topLeftCorner.x / scale,
                        y: code.location.topLeftCorner.y / scale
                    },
                    topRightCorner: {
                        x: code.location.topRightCorner.x / scale,
                        y: code.location.topRightCorner.y / scale
                    },
                    bottomLeftCorner: {
                        x: code.location.bottomLeftCorner.x / scale,
                        y: code.location.bottomLeftCorner.y / scale
                    },
                    bottomRightCorner: {
                        x: code.location.bottomRightCorner.x / scale,
                        y: code.location.bottomRightCorner.y / scale
                    }
                };
                
                this.drawQRCodeBox(scaledLocation);
            } else {
                this.clearOverlay();
            }
            
            requestAnimationFrame(detectQR);
        };
        
        detectQR();

        window.addEventListener('resize', () => {
            const overlay = document.getElementById('overlay');
            if (overlay) {
                overlay.width = this.videoElement.offsetWidth;
                overlay.height = this.videoElement.offsetHeight;
            }
        });
    }

    drawQRCodeBox(location) {
        const overlay = document.getElementById('overlay');
        if (!overlay) return;
        
        const ctx = overlay.getContext('2d', { willReadFrequently: true });
        const video = this.videoElement;
        
        const scaleX = overlay.width / video.videoWidth;
        const scaleY = overlay.height / video.videoHeight;
        
        ctx.clearRect(0, 0, overlay.width, overlay.height);
        
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);
        
        ctx.beginPath();
        ctx.moveTo(location.topLeftCorner.x * scaleX, location.topLeftCorner.y * scaleY);
        ctx.lineTo(location.topRightCorner.x * scaleX, location.topRightCorner.y * scaleY);
        ctx.lineTo(location.bottomRightCorner.x * scaleX, location.bottomRightCorner.y * scaleY);
        ctx.lineTo(location.bottomLeftCorner.x * scaleX, location.bottomLeftCorner.y * scaleY);
        ctx.closePath();
        ctx.stroke();
        
        const cornerSize = 10;
        ctx.setLineDash([]);
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        ctx.moveTo(location.topLeftCorner.x * scaleX, location.topLeftCorner.y * scaleY);
        ctx.lineTo(location.topLeftCorner.x * scaleX + cornerSize, location.topLeftCorner.y * scaleY);
        ctx.moveTo(location.topLeftCorner.x * scaleX, location.topLeftCorner.y * scaleY);
        ctx.lineTo(location.topLeftCorner.x * scaleX, location.topLeftCorner.y * scaleY + cornerSize);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(location.topRightCorner.x * scaleX, location.topRightCorner.y * scaleY);
        ctx.lineTo(location.topRightCorner.x * scaleX - cornerSize, location.topRightCorner.y * scaleY);
        ctx.moveTo(location.topRightCorner.x * scaleX, location.topRightCorner.y * scaleY);
        ctx.lineTo(location.topRightCorner.x * scaleX, location.topRightCorner.y * scaleY + cornerSize);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(location.bottomLeftCorner.x * scaleX, location.bottomLeftCorner.y * scaleY);
        ctx.lineTo(location.bottomLeftCorner.x * scaleX + cornerSize, location.bottomLeftCorner.y * scaleY);
        ctx.moveTo(location.bottomLeftCorner.x * scaleX, location.bottomLeftCorner.y * scaleY);
        ctx.lineTo(location.bottomLeftCorner.x * scaleX, location.bottomLeftCorner.y * scaleY - cornerSize);
        ctx.stroke();
        
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

        const centerX = (location.topLeftCorner.x + location.topRightCorner.x + 
                        location.bottomLeftCorner.x + location.bottomRightCorner.x) / 4 * scaleX;
        const centerY = (location.topLeftCorner.y + location.topRightCorner.y + 
                        location.bottomLeftCorner.y + location.bottomRightCorner.y) / 4 * scaleY;

        if (this.threeAnimation) {
            this.threeAnimation.showAtPosition(centerX, centerY);
        }
    }

    clearOverlay() {
        const overlay = document.getElementById('overlay');
        if (!overlay) return;
        
        const ctx = overlay.getContext('2d', { willReadFrequently: true });
        ctx.clearRect(0, 0, overlay.width, overlay.height);
    }
}
