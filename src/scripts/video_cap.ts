export class CameraService {
  private videoElement: HTMLVideoElement;

  constructor(videoElementId: string) {
    const video = document.getElementById(videoElementId) as HTMLVideoElement | null;

    if (!video) {
      throw new Error(`未找到 ID 为 ${videoElementId} 的 <video> 元素`);
    }

    this.videoElement = video;
    this.configureVideoElement();
  }

  private configureVideoElement() {
    this.videoElement.setAttribute('autoplay', '');
    this.videoElement.setAttribute('muted', '');
    this.videoElement.setAttribute('playsinline', '');
    this.videoElement.style.objectFit = 'cover';
  }

  public async startCamera(): Promise<MediaStream> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      this.videoElement.srcObject = stream;
      return stream;
    } catch (err) {
      throw new Error('摄像头访问失败：' + (err as Error).message);
    }
  }

  public stopCamera() {
    const stream = this.videoElement.srcObject as MediaStream;
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      this.videoElement.srcObject = null;
    }
  }
}
