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

function setVolume(instrumentIndex, volume) {
  iMusic(`instr_${instrumentIndex}`).set("volume", volume);
  const volumeInPercent = Math.round(volume*100)
  const volumeBarContainer = document.getElementById(
    `volume_${instrumentIndex}`
  )
  const volumeBar = volumeBarContainer.getElementsByClassName("volume_bar")[0]
  const volumeNum = volumeBarContainer.getElementsByClassName("volume_num")[0]
  volumeNum.innerHTML = `${volumeInPercent}`
  volumeBar.style.height = `${volumeInPercent}%`
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
