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
  let currentMode = document.getElementById('current-mode');
  if (style) {
    style.remove();
    currentMode.textContent = 'Light';
  } else {
    style = document.createElement('STYLE');
    currentMode.textContent = 'Dark';
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

  // let blinkIndicator = document.getElementById('blink-indicator');
  let body = document.getElementsByTagName('body');
  const predict = async () => {
    let result = await blink.getBlinkPrediction();
    updateModelStatus();

    if (result) {
      // if (result.blink) {
      //   blinkIndicator.style.color = 'red';
      // } else {
      //   blinkIndicator.style.color = 'green';
      // }
      if (result.longBlink) {
        toggleMode();
      }
    }
    raf = requestAnimationFrame(predict);
  };
  predict();
};

init();
