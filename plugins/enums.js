const fnCommandPrefix = "fn";
const FunctionAction = {
  beginExploration: `${fnCommandPrefix}_beginExploration`,
  incrementStep: `${fnCommandPrefix}_incrementStep`,
  endExploration: `${fnCommandPrefix}_endExploration`,
  decrementStep: `${fnCommandPrefix}_decrementStep`,
  goToBegin: `${fnCommandPrefix}_goToBegin`,
  goToEnd: `${fnCommandPrefix}_goToEnd`,
  batchExploration: `${fnCommandPrefix}_batchExploration`,
};
const KeyboardKey = {
  arrowRight: 39,
  arrowLeft: 37,
  b: 66,
};
const AudioSample = {
  noYAtX: "/audio/no_y.mp3",
  displayedChartBorder: "/audio/chart_border.mp3",
};
const FunctionVoiceMessageFormat = {
  localMax: "max",
  localMin: "min",
  intersectX: "x",
  intersectY: "y",
  currentCoordinates: "x: {x}, y: {y}", //da completare con format-unicorn
};
const TextToSpeechOption = {
  maxMin: "massimi-e-minimi", //poi da dividere gli spazi per ottenere la descrizione
  coordinates: "coordinate",
  axisIntersections: "intersezioni-con-gli-assi",
};

export default ({ app }, inject) => {
  inject("FunctionAction", FunctionAction);
  inject("KeyboardKey", KeyboardKey);
  inject("AudioSample", AudioSample);
  inject("TextToSpeechOption", TextToSpeechOption);
  inject("FunctionVoiceMessageFormat", FunctionVoiceMessageFormat);
};
