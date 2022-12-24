
const videoElement = document.getElementsByClassName('input_video')[0];
const canvasElement = document.getElementsByClassName('output_canvas')[0];
const canvasCtx = canvasElement.getContext('2d');
const indicator = document.getElementById('indicator');

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
        startPlaying()
        // Origin (x=0, y=0) is the upper right corner
        for (const landmarks of results.multiHandLandmarks) {
            const gesture = parseHandGesture(landmarks);
            const instrumentIndex = getTargetedIndex(landmarks[9]);
            showTargetIndicator(instrumentIndex)
            gesture.action(instrumentIndex);
            drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS,
                        {color: gesture.color, lineWidth: 5});
            drawLandmarks(canvasCtx, landmarks, {color: '#000000', lineWidth: 2});
        }
    }
    canvasCtx.restore();
}

const Gestures = {
    none: {color: "#FFFFFF", action: function(instrumentIndex) {
        
    }},
    pinch: {color: "#FFFF00", action: function(instrumentIndex) {

    }},
    thumbUp: {color: "#00FF00", action: function(instrumentIndex) {
        turnOn(instrumentIndex)
    }},
    thumbDown: {color: "#FF0000", action: function(instrumentIndex) {
        turnOff(instrumentIndex)
    }},
    countOne: {color: "#FFFF00", action: function(instrumentIndex) {
        setIntensity(instrumentIndex, 1);
    }},
    countTwo: {color: "#00FFFF", action: function(instrumentIndex) {
        setIntensity(instrumentIndex, 2);
    }},
    countThree: {color: "#FF00FF", action: function(instrumentIndex) {
        
    }},
}

function getTargetedIndex(middleJoint) {
    const x = middleJoint.x
    const y = middleJoint.y
    if (x <= 0.5) {
        if (y <= 0.5) {
            return 1
        } else {
            return 3
        }
    } else {
        if (y <= 0.5) {
            return 0
        } else {
            return 2
        }
    }
}

function hideTargetIndicators() {
    var previouslyTargeted = document.getElementsByClassName("instrument_area targeted")

    Array.prototype.forEach.call(previouslyTargeted, function(targeted) {
        // Do stuff here
        targeted.classList.remove("targeted")
    });
}

function showTargetIndicator(index) {
    document.getElementById(`instrument_area_${index}`).classList.add("targeted")
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

    if (isThumbGesture(distIndexJointToThumb, distIndexJointToIndex, distMiddleJointToMiddle, distRingJointToRing, distLittleJointToLittle)) {
        if (isThumbsUpIfThumbGesture(thumb, indexJoint)) {
            return Gestures.thumbDown;
        }
        if (isThumbsDownIfThumbGesture(thumb, indexJoint)) {
            return Gestures.thumbUp;
        }
    }

    if (isCountOne(distIndexJointToThumb, distIndexJointToIndex, distMiddleJointToMiddle, distRingJointToRing, distLittleJointToLittle)) {
        return Gestures.countOne;
    }
    if (isCountTwo(distIndexJointToThumb, distIndexJointToIndex, distMiddleJointToMiddle, distRingJointToRing, distLittleJointToLittle)) {
        return Gestures.countTwo;
    }
    if (isCountThree(distIndexJointToThumb, distIndexJointToIndex, distMiddleJointToMiddle, distRingJointToRing, distLittleJointToLittle)) {
        return Gestures.countThree;
    }

    return Gestures.none
}

function isPinch(distIndexToThumb) {
    return distIndexToThumb < 0.05
}

function isThumbGesture(distIndexJointToThumb, distIndexJointToIndex, distMiddleJointToMiddle, distRingJointToRing, distLittleJointToLittle) {
    const shouldBeAdjacent = new Array(distIndexJointToIndex, distMiddleJointToMiddle, distRingJointToRing, distLittleJointToLittle);
    if (shouldBeAdjacent.every(isAdjacent) && distIndexJointToThumb > 0.15) {
        return true
    }
    return false
}

function isThumbsUpIfThumbGesture(thumb, indexJoint) {
    return thumb.y-indexJoint.y > 0.08
}

function isThumbsDownIfThumbGesture(thumb, indexJoint) {
    return thumb.y-indexJoint.y < -0.08
}

function isCountOne(distIndexJointToThumb, distIndexJointToIndex, distMiddleJointToMiddle, distRingJointToRing, distLittleJointToLittle) {
    const shouldBeAdjacent = new Array(distIndexJointToThumb, distMiddleJointToMiddle, distRingJointToRing, distLittleJointToLittle);
    if (shouldBeAdjacent.every(isAdjacent) && isApart(distIndexJointToIndex)) {
        return true
    }
    return false
}

function isCountTwo(distIndexJointToThumb, distIndexJointToIndex, distMiddleJointToMiddle, distRingJointToRing, distLittleJointToLittle) {
    const shouldBeAdjacent = new Array(distIndexJointToThumb, distRingJointToRing, distLittleJointToLittle);
    const shouldBeApart = new Array(distIndexJointToIndex, distMiddleJointToMiddle);
    if (shouldBeAdjacent.every(isAdjacent) && shouldBeApart.every(isApart)) {
        return true
    }
    return false
}

function isCountThree(distIndexJointToThumb, distIndexJointToIndex, distMiddleJointToMiddle, distRingJointToRing, distLittleJointToLittle) {
    const shouldBeAdjacent = new Array(distIndexJointToThumb, distLittleJointToLittle);
    const shouldBeApart = new Array(distIndexJointToIndex, distMiddleJointToMiddle, distRingJointToRing);
    if (shouldBeAdjacent.every(isAdjacent) && shouldBeApart.every(isApart)) {
        return true
    }
    return false
}

function isAdjacent(distance) {
    return distance < 0.1;
}

function isApart(distance) {
    return distance > 0.15;
}

function getLandmarkDistance(landmarkA, landmarkB) {
    const distX = landmarkA.x - landmarkB.x
    const distY = landmarkA.y - landmarkB.y
    return Math.hypot(distX, distY)
}

const hands = new Hands({locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
  }});
  hands.setOptions({
    maxNumHands: 2,
    modelComplexity: 0,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
  });
  hands.onResults(onResults);
  
const camera = new Camera(videoElement, {
    onFrame: async () => {
      await hands.send({image: videoElement});
    },
    width: 1280,
    height: 720
});
camera.start();


