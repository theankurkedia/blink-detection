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

function toggleMode() {
  let style = document.getElementById('dark-mode-style');
  if (style) {
    style.remove();
  } else {
    style = document.createElement('STYLE');
    style.setAttribute('id', 'dark-mode-style'), (style.type = 'text/css');
    style.appendChild(
      document.createTextNode(
        'html { filter: invert(1) hue-rotate(180deg); color-scheme: dark;}'
      )
    );
    document.getElementsByTagName('html')[0].appendChild(style);
  }
}

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
  // let blinkIndicator = document.getElementById('blink-indicator');
  let longBlinkIndicator = document.getElementById('long-blink-indicator');
  let rateIndicator = document.getElementById('blink-rate');
  let body = document.getElementsByTagName('body');
  // let winkIndicator = document.getElementById('wink-indicator');
  const predict = async () => {
    let result = await blink.getBlinkPrediction();
    updateModelStatus();

    if (result) {
      // if (result.blink) {
      //   blinkIndicator.style.color = 'red';
      // } else {
      //   blinkIndicator.style.color = 'green';
      // }
      if (result.rate !== undefined) {
        rateIndicator.textContent = result.rate;
      }
      if (result.longBlink) {
        toggleMode();
      }

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
