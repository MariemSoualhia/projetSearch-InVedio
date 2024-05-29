/* eslint-disable no-restricted-globals */
self.onmessage = async function (event) {
  const { videoData, frameInterval, width, height } = event.data;
  const videoBlob = new Blob([videoData], { type: 'video/mp4' });
  const videoURL = URL.createObjectURL(videoBlob);
  const offscreenCanvas = new OffscreenCanvas(width, height);
  const context = offscreenCanvas.getContext('2d');
  const frames = [];

  const offscreenVideo = document.createElement("video");
  offscreenVideo.src = videoURL;
  offscreenVideo.crossOrigin = 'anonymous';
  offscreenVideo.width = width;
  offscreenVideo.height = height;

  await new Promise(resolve => {
    offscreenVideo.onloadeddata = () => {
      resolve();
    };
  });

  let currentTime = 0;

  const captureFrame = async () => {
    if (currentTime < offscreenVideo.duration) {
      offscreenVideo.currentTime = currentTime;
      await new Promise(resolve => {
        offscreenVideo.onseeked = async () => {
          context.drawImage(offscreenVideo, 0, 0, width, height);
          const blob = await offscreenCanvas.convertToBlob({ type: 'image/jpeg' });
          frames.push({ time: currentTime, image: URL.createObjectURL(blob) });
          currentTime += frameInterval;
          resolve();
        };
      });
      await captureFrame();
    } else {
      postMessage(frames);
    }
  };

  await captureFrame();
};
