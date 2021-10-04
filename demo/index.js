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

var raf;
const init = async () => {
  await blink.loadModel();
  await blink.setUpCamera(videoElement);

  // let stopButton = document.getElementById('stop-button');
  // if (stopButton) {
  //   stopButton.addEventListener('click', () => {
  //     cancelAnimationFrame(raf);
  //     console.log('*** 🔥 testBucket', JSON.stringify(blink.testBucket));
  //   });
  // }

  // let leftEye = document.getElementById('left-eye');
  // let rightEye = document.getElementById('right-eye');
  let blinkIndicator = document.getElementById('blink-indicator');
  let longBlinkIndicator = document.getElementById('long-blink-indicator');
  // let winkIndicator = document.getElementById('wink-indicator');

  const predict = async () => {
    let result = await blink.getBlinkPrediction();
    updateModelStatus();

    if (result) {
      if (result.blink) {
        blinkIndicator.style.color = 'red';
      } else {
        blinkIndicator.style.color = 'green';
      }
      // if (result.longBlink) {
      //   longBlinkIndicator.style.color = 'red';
      // } else {
      //   longBlinkIndicator.style.color = 'green';
      // }

      // if (result.wink) {
      //   winkIndicator.style.color = 'red';
      // } else {
      //   winkIndicator.style.color = 'green';
      // }
      // console.log('*** 🔥 rs', result.left, result.right);
      // if (result.left) {
      //   leftEye.style.color = 'red';
      // } else {
      //   leftEye.style.color = 'green';
      // }
      // if (result.right) {
      //   rightEye.style.color = 'red';
      // } else {
      //   rightEye.style.color = 'green';
      // }
    }
    raf = requestAnimationFrame(predict);
  };
  predict();
};

init();
