
# Blink Detection

Use machine learning in JavaScript to detect a blink and build blink-controlled experiences!

## Demo

Visit [https://gaze-keyboard.netlify.app/](https://gaze-keyboard.netlify.app/) _(Works well on mobile too!!)_ 😃

![](blink-demo.gif)

Uses Tensorflow.js's [face landmark detection model](https://www.npmjs.com/package/@tensorflow-models/face-landmarks-detection).

## Detection

This tool detects when the user blinks. It can also detects a wink.

## How to use

### Install

As a module:

```bash
npm install blink-detection --save
```

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
  console.log('Blink: ', blinkPrediction); //will return 'RIGHT', 'LEFT', 'STRAIGHT' or 'TOP'
  if (blinkPrediction.left === true) {
    // do something when the user looks to the right
  }
  let raf = requestAnimationFrame(predict);
};
predict();
```

Stop the detection:

```js
cancelAnimationFrame(raf);
```
