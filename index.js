import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';

let model, video, rafID;
const VIDEO_SIZE = 500;

// NOTE: temporary, need to change it with z dimension.
// NOTE: Observe the initial values then set the threshold
const DyThreshold = 7;

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
      // NOTE: Error in docs, rightEyeLower0 is mapped to rightEyeUpper0 and vice-versa
      // NOTE: taking center point for now, can add more points for accuracy(mabye)
      let rightLowerEyePoint = prediction.annotations.rightEyeUpper0[3];
      let rightUpperEyePoint = prediction.annotations.rightEyeLower0[4];

      let leftLowerEyePoint = prediction.annotations.leftEyeUpper0[3];
      let leftUpperEyePoint = prediction.annotations.leftEyeLower0[4];
      // let rightLowerEyePointA = prediction.annotations.rightEyeUpper0[2];
      // let rightLowerEyePointC = prediction.annotations.rightEyeUpper0[4];
      // let rightUpperEyePointA = prediction.annotations.rightEyeLower0[3];
      // let rightUpperEyePointC = prediction.annotations.rightEyeLower0[5];

      let rightDy = rightUpperEyePoint[1] - rightLowerEyePoint[1];
      let leftDy = leftUpperEyePoint[1] - leftLowerEyePoint[1];

      let rightClosed = rightDy < DyThreshold;
      let leftClosed = leftDy < DyThreshold;

      // console.log(
      //   // JSON.stringify(prediction.annotations.rightEyeUpper0),
      //   // JSON.stringify(prediction.annotations.rightEyeLower0)
      //   'Dy',
      //   leftDy.toFixed(1),
      //   rightDy.toFixed(1),
      //   leftClosed ? 'closed' : 'open',
      //   rightClosed ? 'closed' : 'open'
      // );
      event = {
        left: leftClosed ? 'closed' : 'open',
        right: rightClosed ? 'closed' : 'open',
        // wink: false,
        // blink: false,
      };
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
  getEyePrediction: renderPrediction,
};

export default wink;
