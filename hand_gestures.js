const videoElement = document.getElementsByClassName("input_video")[0];
const canvasElement = document.getElementsByClassName("output_canvas")[0];
const canvasCtx = canvasElement.getContext("2d");

adjustVideoCanvasToWindowSize();

function adjustVideoCanvasToWindowSize() {
  canvasElement.width = window.innerWidth;
  canvasElement.height = window.innerHeight;
}

window.onresize = adjustVideoCanvasToWindowSize;

function onResults(results) {

    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
    hideTargetIndicators()
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      // Origin (x=0, y=0) is the upper right corner
      for (const landmarks of results.multiHandLandmarks) {
        const gesture = parseHandGesture(landmarks);
        const indicativeLandMark = gesture == Gestures.pinch ? landmarks[8] : landmarks[9]
        const instrumentIndex = getTargetedIndex(indicativeLandMark)
        showTargetIndicator(instrumentIndex);
        if (gesture == Gestures.pinch) {
          const volume = getRelativeHeight(instrumentIndex, indicativeLandMark)
          gesture.action(instrumentIndex, volume)
        } else {
          gesture.action(instrumentIndex);
        }
        if (gesture.image != "") gestureReaction(instrumentIndex, gesture.image)
        drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {
          color: gesture.color,
          lineWidth: 5,
        });
        drawLandmarks(canvasCtx, landmarks, { color: "#000000", lineWidth: 2 });
      }
    }
    canvasCtx.restore();
  }

const Gestures = {
    none: {image: "", color: "#FFFFFF", action: function(instrumentIndex) {}},
    pinch: {image: "pinch", color: "#0000FF", action: function(instrumentIndex, volume) {
      setVolume(instrumentIndex, volume)
    }},
    thumbUp: {image: "up", color: "#00FF00", action: function(instrumentIndex) {
        startPlaying()
        turnOn(instrumentIndex)
    }},
    thumbDown: {image: "down", color: "#FF0000", action: function(instrumentIndex) {
        turnOff(instrumentIndex)
    }},
    countOne: {image: "pointer", color: "#FFFF00", action: function(instrumentIndex) {
        setIntensity(instrumentIndex, 1);
    }},
    countTwo: {image: "V2", color: "#00FFFF", action: function(instrumentIndex) {
        setIntensity(instrumentIndex, 2);
    }},
    countThree: {color: "#FF00FF", action: function(instrumentIndex) {
        
    }},
}


function getTargetedIndex(middleJoint) {
  const x = middleJoint.x;
  const y = middleJoint.y;
  if (x <= 0.5) {
    if (y <= 0.5) {
      return 1;
    } else {
      return 3;
    }
  } else {
    if (y <= 0.5) {
      return 0;
    } else {
      return 2;
    }
  }
}

function hideTargetIndicators() {
  var previouslyTargeted = document.getElementsByClassName(
    "instrument_area targeted"
  );

  Array.prototype.forEach.call(previouslyTargeted, function (targeted) {
    targeted.classList.remove("targeted");
  });
}

function showTargetIndicator(index) {
  document.getElementById(`instrument_area_${index}`).classList.add("targeted");
}

function parseHandGesture(landmarks) {
  const thumb = landmarks[4];
  const indexJoint = landmarks[5];
  const index = landmarks[8];
  const middleJoint = landmarks[9];
  const middle = landmarks[12];
  const ringJoint = landmarks[13];
  const ring = landmarks[16];
  const littleJoint = landmarks[17];
  const little = landmarks[20];

  const distIndexJointToThumb = getLandmarkDistance(indexJoint, thumb);
  const distIndexToThumb = getLandmarkDistance(index, thumb);
  const distIndexJointToIndex = getLandmarkDistance(indexJoint, index);
  const distMiddleJointToMiddle = getLandmarkDistance(middleJoint, middle);
  const distRingJointToRing = getLandmarkDistance(ringJoint, ring);
  const distLittleJointToLittle = getLandmarkDistance(littleJoint, little);
  const indexIsUpright = isUpright(index, indexJoint);
  const middleIsUpright = isUpright(middle, middleJoint);
  const ringIsUpright = isUpright(ring, ringJoint);
  const littleIsUpright = isUpright(little, littleJoint);

  if (
    isPinch(
      distIndexToThumb,
      distMiddleJointToMiddle,
      distRingJointToRing,
      distLittleJointToLittle,
      middleIsUpright,
      ringIsUpright,
      littleIsUpright
    )
  ) {
    return Gestures.pinch;
  }

  if (
    isThumbGesture(
      distIndexJointToThumb,
      distIndexJointToIndex,
      distMiddleJointToMiddle,
      distRingJointToRing,
      distLittleJointToLittle
    )
  ) {
    if (isUpright(thumb, indexJoint)) {
      return Gestures.thumbUp;
    }
    if (isDownright(thumb, indexJoint)) {
      return Gestures.thumbDown;
    }
  }

  if (
    isCountOne(
      distIndexJointToThumb,
      distIndexJointToIndex,
      distMiddleJointToMiddle,
      distRingJointToRing,
      distLittleJointToLittle,
      indexIsUpright
    )
  ) {
    return Gestures.countOne;
  }
  if (
    isCountTwo(
      distIndexJointToThumb,
      distIndexJointToIndex,
      distMiddleJointToMiddle,
      distRingJointToRing,
      distLittleJointToLittle,
      indexIsUpright,
      middleIsUpright
    )
  ) {
    return Gestures.countTwo;
  }

  return Gestures.none;
}

function isPinch(
  distIndexToThumb,
  distMiddleJointToMiddle,
  distRingJointToRing,
  distLittleJointToLittle,
  middleIsUpright,
  ringIsUpright,
  littleIsUpright
) {
  const shouldBeApart = new Array(
    distMiddleJointToMiddle,
    distRingJointToRing,
    distLittleJointToLittle
  );
  return (
    distIndexToThumb < 0.05 &&
    shouldBeApart.every(isApart) &&
    middleIsUpright &&
    ringIsUpright &&
    littleIsUpright
  );
}

function isThumbGesture(
  distIndexJointToThumb,
  distIndexJointToIndex,
  distMiddleJointToMiddle,
  distRingJointToRing,
  distLittleJointToLittle
) {
  const shouldBeAdjacent = new Array(
    distIndexJointToIndex,
    distMiddleJointToMiddle,
    distRingJointToRing,
    distLittleJointToLittle
  );
  if (shouldBeAdjacent.every(isAdjacent) && distIndexJointToThumb > 0.15) {
    return true;
  }
  return false;
}

function isCountOne(
  distIndexJointToThumb,
  distIndexJointToIndex,
  distMiddleJointToMiddle,
  distRingJointToRing,
  distLittleJointToLittle,
  indexIsUpright
) {
  const shouldBeAdjacent = new Array(
    distIndexJointToThumb,
    distMiddleJointToMiddle,
    distRingJointToRing,
    distLittleJointToLittle
  );
  if (
    shouldBeAdjacent.every(isAdjacent) &&
    isApart(distIndexJointToIndex && indexIsUpright)
  ) {
    return true;
  }
  return false;
}

function isCountTwo(
  distIndexJointToThumb,
  distIndexJointToIndex,
  distMiddleJointToMiddle,
  distRingJointToRing,
  distLittleJointToLittle,
  indexIsUpright,
  middleIsUpright
) {
  const shouldBeAdjacent = new Array(
    distIndexJointToThumb,
    distRingJointToRing,
    distLittleJointToLittle
  );
  const shouldBeApart = new Array(
    distIndexJointToIndex,
    distMiddleJointToMiddle
  );
  if (
    shouldBeAdjacent.every(isAdjacent) &&
    shouldBeApart.every(isApart) &&
    indexIsUpright &&
    middleIsUpright
  ) {
    return true;
  }
  return false;
}

function isCountThree(
  distIndexJointToThumb,
  distIndexJointToIndex,
  distMiddleJointToMiddle,
  distRingJointToRing,
  distLittleJointToLittle,
  indexIsUpright,
  middleIsUpright,
  ringIsUpright
) {
  const shouldBeAdjacent = new Array(
    distIndexJointToThumb,
    distLittleJointToLittle
  );
  const shouldBeApart = new Array(
    distIndexJointToIndex,
    distMiddleJointToMiddle,
    distRingJointToRing
  );
  if (
    shouldBeAdjacent.every(isAdjacent) &&
    shouldBeApart.every(isApart) &&
    indexIsUpright &&
    middleIsUpright &&
    ringIsUpright
  ) {
    return true;
  }
  return false;
}

function isUpright(tip, joint) {
  return tip.y - joint.y < -0.1;
}

function isDownright(tip, joint) {
  return tip.y - joint.y > 0.1;
}

function isAdjacent(distance) {
  return distance < 0.1;
}

function isApart(distance) {
  return distance > 0.15;
}

function getLandmarkDistance(landmarkA, landmarkB) {
  const distX = landmarkA.x - landmarkB.x;
  const distY = landmarkA.y - landmarkB.y;
  return Math.hypot(distX, distY);
}

function getRelativeHeight(instrumentIndex, landmark) {
    const lowerBound = (instrumentIndex < 2) ? 0 : 0.5
    const landMarkHeight = landmark.y
    return 1 - ((landMarkHeight - lowerBound) / 0.5)
}

const hands = new Hands({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
  },
});
hands.setOptions({
  maxNumHands: 2,
  modelComplexity: 0,
  minDetectionConfidence: 0.7,
  minTrackingConfidence: 0.7,
});
hands.onResults(onResults);

const camera = new Camera(videoElement, {
  onFrame: async () => {
    await hands.send({ image: videoElement });
  },
  width: 1280,
  height: 720,
});
camera.start();
