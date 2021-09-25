import blink from '../index.js';

const updateModelStatus = () => {
  const status = document.querySelector('.model-status');
  if (status) {
    status.innerHTML = 'Model loaded! You can start!';
    status.classList.add('fade-out');
    status.classList.remove('model-status');
  }
};

const videoElement = document.querySelector('video');

const init = async () => {
  await blink.loadModel();
  await blink.setUpCamera(videoElement);

  let leftEye = document.getElementById('left-eye');
  let rightEye = document.getElementById('right-eye');
  const predict = async () => {
    let result = await blink.getBlinkPrediction();
    updateModelStatus();

    // console.log('*** 🔥 result', result);
    if (result) {
      if (result.left) {
        leftEye.style.color = 'red';
      } else {
        leftEye.style.color = 'green';
      }
      if (result.right) {
        rightEye.style.color = 'red';
      } else {
        rightEye.style.color = 'green';
      }
    }
    let raf = requestAnimationFrame(predict);
  };
  predict();
};

init();
