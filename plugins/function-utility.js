export default ({ app }, inject) => {
  class FunctionUtility {
    calculateNewVisualizedInterval(
      domXRange,
      domYRange,
      pivotPoint,
      transformationType,
      speed
    ) {
      const leftBorderValue = domXRange[0];
      const rightBorderValue = domXRange[1];
      const bottomBorderValue = domYRange[0];
      const topBorderValue = domYRange[1];
      const distanceFromLeft = pivotPoint.x - leftBorderValue;
      const distanceFromRight = rightBorderValue - pivotPoint.x;
      const distanceFromBottom = pivotPoint.y - bottomBorderValue;
      const distanceFromTop = topBorderValue - pivotPoint.y;

      console.log("Transformation type: " + transformationType);

      switch (transformationType) {
        case app.$FunctionGesture.zoomIn:
          break;
        case app.$FunctionGesture.zoomOut:
          break;
        case app.$FunctionGesture.dragRight:
        case app.$FunctionGesture.dragLeft:
          //TODO: parametrizzare spostamento in base a se il drag è left o right
          let offset =
            speed *
            (rightBorderValue - leftBorderValue) *
            (app.$FunctionGesture.dragRight ? 1 : -1);
          const newLeftBorderValue = leftBorderValue + offset;
          const newRightBorderValue = rightBorderValue + offset;
          return {
            x: [newLeftBorderValue, newRightBorderValue],
            y: [bottomBorderValue, topBorderValue],
          };
        case app.$FunctionGesture.dragUp:
          break;
        case app.$FunctionGesture.dragDown:
          break;
      }
    }
  }

  inject("functionUtility", new FunctionUtility());
};
