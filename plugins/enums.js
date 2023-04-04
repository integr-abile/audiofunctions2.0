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

export default ({ app }, inject) => {
  inject("FunctionAction", FunctionAction);
  inject("KeyboardKey", KeyboardKey);
};
