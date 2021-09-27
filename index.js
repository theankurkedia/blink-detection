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

// NOTE: temporary, need to change it with z dimension.
// NOTE: Observe the initial values then set the threshold
const DyThreshold = 7;

// TODO: need to move packages as peer deps

let event;

let testBucket = {
  '-1.5--1': { avg: 0, freq: 0 },
  '-1--0.5': { avg: 0, freq: 0 },
  '-0.5-0': { avg: 0, freq: 0 },
  '0-0.5': { avg: 0, freq: 0 },
  '0.5-1': { avg: 0, freq: 0 },
  '1-1.5': { avg: 0, freq: 0 },
  '1.5-2': { avg: 0, freq: 0 },
  '2-2.5': { avg: 0, freq: 0 },
  '2.5-3': { avg: 0, freq: 0 },
  '3-3.5': { avg: 0, freq: 0 },
  '3.5-4': { avg: 0, freq: 0 },
};

function getModifiedBucket(val, dy) {
  return {
    avg:
      (dy + testBucket[val]['freq'] * testBucket[val]['avg']) /
      (testBucket[val]['freq'] + 1),
    freq: testBucket[val]['freq'] + 1,
  };
}
function populateTestBucket(dy, irisZ) {
  if (irisZ > 0 && irisZ <= 0.5) {
    testBucket['0-0.5'] = getModifiedBucket('0-0.5', dy);
  } else if (irisZ > 0.5 && irisZ <= 1) {
    testBucket['0.5-1'] = getModifiedBucket('0.5-1', dy);
  } else if (irisZ > 1 && irisZ <= 1.5) {
    testBucket['1-1.5'] = getModifiedBucket('1-1.5', dy);
  } else if (irisZ > 1.5 && irisZ <= 2) {
    testBucket['1.5-2'] = getModifiedBucket('1.5-2', dy);
  } else if (irisZ > 2 && irisZ <= 2.5) {
    testBucket['2-2.5'] = getModifiedBucket('2-2.5', dy);
  } else if (irisZ > 2.5 && irisZ <= 3) {
    testBucket['2.5-3'] = getModifiedBucket('2.5-3', dy);
  } else if (irisZ > 3 && irisZ <= 3.5) {
    testBucket['3-3.5'] = getModifiedBucket('3-3.5', dy);
  } else if (irisZ > 3.5 && irisZ <= 4) {
    testBucket['3.5-4'] = getModifiedBucket('3.5-4', dy);
  } else if (irisZ > -0.5 && irisZ <= 0) {
    testBucket['-0.5-0'] = getModifiedBucket('-0.5-0', dy);
  } else if (irisZ > -1 && irisZ <= -0.5) {
    testBucket['-1--0.5'] = getModifiedBucket('-1--0.5', dy);
  } else if (irisZ > -1.5 && irisZ <= -1) {
    testBucket['-1.5--1'] = getModifiedBucket('-1.5--1', dy);
  }
}

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

      let rightIrisZ = prediction.annotations.rightEyeIris[0][2];
      let leftIrisZ = prediction.annotations.leftEyeIris[0][2];

      populateTestBucket(leftDy, leftIrisZ);
      let rightClosed = rightDy < DyThreshold;
      let leftClosed = leftDy < DyThreshold;

      console.log(rightIrisZ.toFixed(2), '|', rightDy.toFixed(1));
      event = {
        left: leftClosed,
        right: rightClosed,
        // wink: false,
        // blink: false,
      };
    });
  }
  return event;
}

const blink = {
  loadModel: loadModel,
  setUpCamera: setUpCamera,
  getBlinkPrediction: renderPrediction,
  // For testing purpose only
  testBucket,
};

export default blink;
