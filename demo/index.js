import wink from '../index.js';

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
  await wink.loadModel();
  await wink.setUpCamera(videoElement);

  const predict = async () => {
    let result = await wink.getWinkPrediction();
    updateModelStatus();

    // console.log('*** 🔥 result', result);
    let raf = requestAnimationFrame(predict);
  };
  predict();
};

init();
