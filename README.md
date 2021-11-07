# Blink Detection

Use machine learning in JavaScript to detect a blink and build blink-controlled experiences!

## Demo

Visit [https://blink-detection.vercel.app](https://blink-detection.vercel.app) _(Works on mobile too!!)_

<!-- ![](blink-demo.gif) -->

Uses Tensorflow.js's [face landmark detection model](https://www.npmjs.com/package/@tensorflow-models/face-landmarks-detection).

## Detection

This tool detects when the user blinks. It can also detect a wink and separate eye blinks as well.

## Installation

Via npm:

Using `yarn`:

    $ yarn add blink-detection

## How to use

### Code sample

Start by importing it:

```js
import blink from 'blink-detection';
```

Load the machine learning model:

```js
await blink.loadModel();
```

Then, set up the camera feed needed for the detection. The `setUpCamera` method needs a `video` HTML element and, optionally, a camera device ID if you are using more than the default webcam.

```js
const videoElement = document.querySelector('video');

const init = async () => {
  // Using the default webcam
  await gaze.setUpCamera(videoElement);

  // Or, using more camera input devices
  const mediaDevices = await navigator.mediaDevices.enumerateDevices();
  const camera = mediaDevices.find(
    (device) =>
      device.kind === 'videoinput' &&
      device.label.includes(/* The label from the list of available devices*/)
  );

  await gaze.setUpCamera(videoElement, camera.deviceId);
};
```

Run the predictions:

```js
const predict = async () => {
  const blinkPrediction = await blink.getBlinkPrediction();
  console.log('Blink: ', blinkPrediction); // will return an object indicating the booleans for different states
  // expect blinkPrediction to be {
  //  blink: boolean,
  //  wink: boolean,
  //  longBlink: boolean,
  //  left: boolean,
  //  right: boolean,
  //  rate: number
  // }
  if (blinkPrediction.blink) {
    // do something when the user blinks
  }
  let raf = requestAnimationFrame(predict);
};
predict();
```

Stop the detection:

```js
cancelAnimationFrame(raf);
```
