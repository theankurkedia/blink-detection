import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';

let model, video, event, blinkRate;
const VIDEO_SIZE = 500;
let blinkCount = 0;
let tempBlinkRate = 0;
let rendering = true;
let rateInterval;
const EAR_THRESHOLD = 0.27;

function initBlinkRateCalculator() {
  rateInterval = setInterval(() => {
    blinkRate = tempBlinkRate * 6;
    tempBlinkRate = 0;
  }, 10000);
}

const loadModel = async () => {
  await tf.setBackend('webgl');

  model = await faceLandmarksDetection.load(
    faceLandmarksDetection.SupportedPackages.mediapipeFacemesh,
    { maxFaces: 1 }
  );
};

const setUpCamera = async (videoElement, webcamId = undefined) => {
  video = videoElement;
  const mediaDevices = await navigator.mediaDevices.enumerateDevices();

  const defaultWebcam = mediaDevices.find(
    (device) =>
      device.kind === 'videoinput' && device.label.includes('Built-in')
  );

  const cameraId = defaultWebcam ? defaultWebcam.deviceId : webcamId;

  const stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      facingMode: 'user',
      deviceId: cameraId,
      width: VIDEO_SIZE,
      height: VIDEO_SIZE,
    },
  });

  video.srcObject = stream;
  video.play();
  video.width = 500;
  video.height = 500;

  return new Promise((resolve) => {
    video.onloadedmetadata = () => {
      resolve(video);
      initBlinkRateCalculator();
    };
  });
};

function stopPrediction() {
  rendering = false;
  clearInterval(rateInterval);
}
function updateBlinkRate() {
  tempBlinkRate++;
}

function getEucledianDistance(x1, y1, x2, y2) {
  return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
}

function getEAR(upper, lower) {
  return (
    (getEucledianDistance(upper[5][0], upper[5][1], lower[4][0], lower[4][1]) +
      getEucledianDistance(
        upper[3][0],
        upper[3][1],
        lower[2][0],
        lower[2][1]
      )) /
    (2 *
      getEucledianDistance(upper[0][0], upper[0][1], upper[8][0], upper[8][1]))
  );
}

function isVoluntaryBlink(blinkDetected) {
  // NOTE: checking if blink is detected in atleast 5 consecutive cycles, values lesser than that can be considered a normal blink.
  // NOTE: adding this to distinguish intentional blinks
  if (blinkDetected) {
    blinkCount++;
    if (blinkCount > 4) {
      blinkCount = 0;
      return true;
    }
  } else {
    blinkCount = 0;
  }
  return false;
}

async function renderPrediction() {
  if (rendering) {
    const predictions = await model.estimateFaces({
      input: video,
      returnTensors: false,
      flipHorizontal: false,
      predictIrises: true,
    });

    if (predictions.length > 0) {
      predictions.forEach((prediction) => {
        // NOTE: Iris position did not work as the diff remains almost same, so trying 0th upper and lower eyes
        // NOTE: Error in docs, rightEyeLower0 is mapped to rightEyeUpper0 and vice-versa
        // NOTE: taking center point for now, can add more points for accuracy(mabye)

        // Other logic
        // NOTE: Found another way to detect it by Eye Aspect Ratio https://www.pyimagesearch.com/2017/04/24/eye-blink-detection-opencv-python-dlib/
        // NOTE: Found it to be more accurate and gives better prection in cases where earlier method did not work.
        let lowerRight = prediction.annotations.rightEyeUpper0;
        let upperRight = prediction.annotations.rightEyeLower0;
        const rightEAR = getEAR(upperRight, lowerRight);

        let lowerLeft = prediction.annotations.leftEyeUpper0;
        let upperLeft = prediction.annotations.leftEyeLower0;
        const leftEAR = getEAR(upperLeft, lowerLeft);

        let blinked = leftEAR <= EAR_THRESHOLD && rightEAR <= EAR_THRESHOLD;
        if (blinked) {
          updateBlinkRate();
        }
        event = {
          left: leftEAR <= EAR_THRESHOLD,
          right: rightEAR <= EAR_THRESHOLD,
          wink: leftEAR <= EAR_THRESHOLD || rightEAR <= EAR_THRESHOLD,
          blink: blinked,
          longBlink: isVoluntaryBlink(blinked),
          rate: blinkRate,
        };
      });
    }
  }
  return event;
}

const blink = {
  loadModel: loadModel,
  setUpCamera: setUpCamera,
  stopPrediction: stopPrediction,
  getBlinkPrediction: renderPrediction,
};

export default blink;
