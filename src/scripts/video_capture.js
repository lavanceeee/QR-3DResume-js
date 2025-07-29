//视频流
function startCamera(videoElementId = 'camera', canvasElementId = 'qr-canvas') {
    const video = document.getElementById(videoElementId);
    const canvas = document.getElementById(canvasElementId);
    const ctx = canvas.getContext('2d');
    
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ 
            video: { 
                facingMode: { ideal: 'environment' },
                width: { ideal: 1280 },
                height: { ideal: 720 }
            } 
        }) 
        .then(function(stream) {
            video.srcObject = stream; 
            video.play();
            
            video.onloadedmetadata = function() {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                scanQRCodeLoop(); //循环获取
            };

            function scanQRCodeLoop() {
                if (video.readyState === video.HAVE_ENOUGH_DATA) {
                    //清空红框
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    
                    const imageData = getVideoFrameImageData(video, canvas);
                    const code = recogniseQRCode(imageData);
                    if (code) {
                        find_location(code, canvas);
                    }
                }
                requestAnimationFrame(scanQRCodeLoop);
            }
        })
        .catch(function(err) {
            alert('无法访问摄像头:'+ err);
        });
    }else {
        alert ('不支持访问摄像头');
    }
}

//获取当前帧的imageData
function getVideoFrameImageData(video, canvas) {
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

//const code = jsQR();
function recogniseQRCode(imageData) {
    return jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert"
    });
}