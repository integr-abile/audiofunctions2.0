const fnCommandPrefix = "fn";
const FunctionAction = {
  beginExplorationIncrement: `${fnCommandPrefix}_beginExplorationIncrement`,
  beginExplorationDecrement: `${fnCommandPrefix}_beginExplorationDecrement`,
  incrementStep: `${fnCommandPrefix}_incrementStep`,
  endExploration: `${fnCommandPrefix}_endExploration`,
  decrementStep: `${fnCommandPrefix}_decrementStep`,
  goToBegin: `${fnCommandPrefix}_goToBegin`,
  goToEnd: `${fnCommandPrefix}_goToEnd`,
  batchExploration: `${fnCommandPrefix}_batchExploration`,
  currentCoordinatesRequest: `${fnCommandPrefix}_currentCoordinatesRequest`,
  currentXIntervalRequest: `${fnCommandPrefix}_currentXIntervalRequest`,
  currentYIntervalRequest: `${fnCommandPrefix}_currentYIntervalRequest`,
  readCurrentExpression: `${fnCommandPrefix}_readCurrentExpression`,
};
const KeyboardKey = {
  arrowRight: 39,
  arrowLeft: 37,
  b: 66,
  x: 88,
  y: 89,
  i: 73,
  c: 67,
  q: 81,
  f: 70,
  enter: 13,
};
const AudioSample = {
  noYAtX: "/audio/no_y.mp3",
  displayedChartBorder: "/audio/chart_border.mp3",
  yAxisIntersection: "/audio/y-axis-intersection.wav",
};
const FunctionVoiceMessageFormat = {
  origin: "origine degli assi",
  currentCoordinates: "Coordinate. x: {x}, y: {y}", //da completare con format-unicorn
  interval: "Asse {axis}, da {min} a {max}", //da completare con format-unicorn
};
const TextToSpeechOption = {
  // maxMin: "massimi-e-minimi", //poi da dividere gli spazi per ottenere la descrizione
  coordinates: "coordinate",
  // axisIntersections: "intersezioni-con-gli-assi",
  intervals: "intervalli-visualizzati",
  currentFunction: "funzione-corrente",
};
const MathSymbolsStringRepresentation = {
  "+": "più",
  "-": "meno",
  "\\cdot": "per",
};

export default ({ app }, inject) => {
  inject("FunctionAction", FunctionAction);
  inject("KeyboardKey", KeyboardKey);
  inject("AudioSample", AudioSample);
  inject("TextToSpeechOption", TextToSpeechOption);
  inject("FunctionVoiceMessageFormat", FunctionVoiceMessageFormat);
  inject("MathSymbolsStringRepresentation", MathSymbolsStringRepresentation);
};
