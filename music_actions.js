var isPlaying = false;

const instruments = [
  { intensity: 1, isPlaying: false}, 
  { intensity: 1, isPlaying: false}, 
  { intensity: 1, isPlaying: false}, 
  { intensity: 1, isPlaying: false}
];

function startPlaying() {
  if (!isPlaying) {
    iMusic.play();
    isPlaying = true
  }
}

function setIntensity(instrumentIndex, intensity) {
  const instrument = instruments[instrumentIndex];
  instrument.intensity = intensity;
  document.getElementById(
    `indicator_${instrumentIndex}`
  ).innerHTML = `${intensity}`;
  if (instrument.isPlaying) iMusic.select(`intensity_${instrumentIndex}`, intensity);
  highlight(instrumentIndex);
}

function setVolume(instrumentIndex, volume) {
  iMusic(`instr_${instrumentIndex}`).set("volume", volume);
  const volumeInPercent = Math.round(volume*100)
  const volumeBarContainer = document.getElementById(
    `volume_${instrumentIndex}`
  )
  const volumeBar = volumeBarContainer.getElementsByClassName("volume_bar")[0]
  const volumeNum = volumeBarContainer.getElementsByClassName("volume_num")[0]
  volumeBarContainer.style.height = "50%"
  volumeBarContainer.style.aspectRatio = "1 / 5"
  volumeNum.innerHTML = `${volumeInPercent}`
  volumeNum.style.opacity = "1"
  volumeBar.style.height = `${volumeInPercent}%`
  setTimeout(function(){
    volumeBarContainer.style.height = "40%"
    volumeBarContainer.style.aspectRatio = "1 / 10"
    volumeNum.style.opacity = "0"
  }, 1500);
}

function turnOff(instrumentIndex) {
  instruments[instrumentIndex].isPlaying = false;
  iMusic.select(`intensity_${instrumentIndex}`, 0);
  document.getElementById(
    `indicator_${instrumentIndex}`
  ).style.backgroundColor = "#FF0000";
  highlight(instrumentIndex);
}

function turnOn(instrumentIndex) {
  instruments[instrumentIndex].isPlaying = true;
  iMusic.select(
    `intensity_${instrumentIndex}`,
    instruments[instrumentIndex].intensity
  );
  document.getElementById(
    `indicator_${instrumentIndex}`
  ).style.backgroundColor = "#00FF00";
  highlight(instrumentIndex);
}

// The part below is used for gesture reactions and displaying icons
function  gestureReaction(instrumentIndex, gestureName) {
  var reaction = document.getElementById(`image_reaction_${instrumentIndex}`);
  reaction.src = `/images/gestures/${gestureName}.svg`
  reaction.style.opacity = "1";
  setTimeout(function(){
  reaction.style.opacity = "0";
  }, 1500);
}

// The part below is used for highlighting when an action happens
function highlight(instrumentIndex) {
  var indicator = document.getElementById(`indicator_${instrumentIndex}`);
  indicator.style.fontSize="50px";
  indicator.style.height="20%";
  setTimeout(function(){
    indicator.style.fontSize="20px";
    indicator.style.height="10%";
  }, 1500);
}
