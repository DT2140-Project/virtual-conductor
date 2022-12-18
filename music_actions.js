var isPlaying = false;

const instruments = [
  { intensity: 1, isPlaying: true}, 
  { intensity: 1, isPlaying: true}, 
  { intensity: 1, isPlaying: true}, 
  { intensity: 1, isPlaying: true}
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
}

function turnOff(instrumentIndex) {
  instruments[instrumentIndex].isPlaying = false;
  iMusic.select(`intensity_${instrumentIndex}`, 0);
  document.getElementById(
    `indicator_${instrumentIndex}`
  ).style.backgroundColor = "#FF0000";
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
}
