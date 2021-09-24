import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';

let model, video, rafID;
let amountStraightEvents = 0;
const VIDEO_SIZE = 500;
let positionXLeftIris;
let positionYLeftIris;
let event;

const isFaceRotated = (landmarks) => {
  const leftCheek = landmarks.leftCheek;
  const rightCheek = landmarks.rightCheek;
  const midwayBetweenEyes = landmarks.midwayBetweenEyes;

  const xPositionLeftCheek = video.width - leftCheek[0][0];
  const xPositionRightCheek = video.width - rightCheek[0][0];
  const xPositionMidwayBetweenEyes = video.width - midwayBetweenEyes[0][0];

  const widthLeftSideFace = xPositionMidwayBetweenEyes - xPositionLeftCheek;
  const widthRightSideFace = xPositionRightCheek - xPositionMidwayBetweenEyes;

  const difference = widthRightSideFace - widthLeftSideFace;

  if (widthLeftSideFace < widthRightSideFace && Math.abs(difference) > 5) {
    return true;
  } else if (
    widthLeftSideFace > widthRightSideFace &&
    Math.abs(difference) > 5
  ) {
    return true;
  }
  return false;
};

async function renderPrediction() {
  const predictions = await model.estimateFaces({
    input: video,
    returnTensors: false,
    flipHorizontal: true,
    predictIrises: true,
  });
  // STEP: Detect a simple blink first
  if (predictions.length > 0) {
    predictions.forEach((prediction) => {
      // NOTE: Iris position did not work as the diff remains almost same, so trying 0th upper and lower eyes

      // let leftDY = prediction.annotations.leftEyeUpper0[4][1] - prediction.annotations.leftEyeUpper0[2][1];
      // let rightDY = rightEyeIris[4][1] - rightEyeIris[2][1];

      console.log(
        JSON.stringify(prediction.annotations.rightEyeUpper0),
        JSON.stringify(prediction.annotations.rightEyeLower0)
        // leftDY.toFixed(1),
        // 'right',
        // rightDX.toFixed(1),
        // rightDY.toFixed(1)
      );
    });
  }
  return event;
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
    };
  });
};

const wink = {
  loadModel: loadModel,
  setUpCamera: setUpCamera,
  getWinkPrediction: renderPrediction,
};

export default wink;
