import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';

const loadModel = async () => {
  await tf.setBackend('webgl');

  model = await faceLandmarksDetection.load(
    faceLandmarksDetection.SupportedPackages.mediapipeFacemesh,
    { maxFaces: 1 }
  );
};

const earThreshold = 0.24;

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
    };
  });
};

let model, video;
const VIDEO_SIZE = 500;

let event;
let blinked = false;

function getIsLongBlink(blinkDetected) {
  // NOTE: checking if blink is detected twice in a row, anything more than that takes more deleberate effort by user.
  if (blinkDetected) {
    if (blinked) {
      return true;
    }
    blinked = true;
  } else {
    blinked = false;
  }

  return false;
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

async function renderPrediction() {
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

      event = {
        left: leftEAR <= earThreshold,
        right: rightEAR <= earThreshold,
        wink: leftEAR <= earThreshold || rightEAR <= earThreshold,
        blink: leftEAR <= earThreshold && rightEAR <= earThreshold,
        longBlink: getIsLongBlink(
          leftEAR <= earThreshold && rightEAR <= earThreshold
        ),
      };
    });
  }
  return event;
}

const blink = {
  loadModel: loadModel,
  setUpCamera: setUpCamera,
  getBlinkPrediction: renderPrediction,
};

export default blink;
