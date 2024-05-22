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
        case app.$FunctionGesture.zoomOut:
          const offsetLeft =
            (distanceFromLeft / 100) *
            speed *
            (transformationType == app.$FunctionGesture.zoomIn ? 1 : -1);
          const offsetRight =
            (distanceFromRight / 100) *
            speed *
            (transformationType == app.$FunctionGesture.zoomIn ? -1 : 1);
          const offsetBottom =
            (distanceFromBottom / 100) *
            speed *
            (transformationType == app.$FunctionGesture.zoomIn ? 1 : -1);
          const offsetTop =
            (distanceFromTop / 100) *
            speed *
            (transformationType == app.$FunctionGesture.zoomIn ? -1 : 1);

          var newLeftBorderValue = leftBorderValue + offsetLeft;
          var newRightBorderValue = rightBorderValue + offsetRight;
          var newBottomBorderValue = bottomBorderValue + offsetBottom;
          var newTopBorderValue = topBorderValue + offsetTop;

          return {
            newDomX: [newLeftBorderValue, newRightBorderValue],
            newDomY: [newBottomBorderValue, newTopBorderValue],
          };

        case app.$FunctionGesture.dragRight:
        case app.$FunctionGesture.dragLeft:
          var offset =
            speed *
            (rightBorderValue - leftBorderValue) *
            (transformationType == app.$FunctionGesture.dragRight ? 1 : -1);
          var newLeftBorderValue = leftBorderValue + offset;
          var newRightBorderValue = rightBorderValue + offset;

          return {
            newDomX: [newLeftBorderValue, newRightBorderValue],
            newDomY: [bottomBorderValue, topBorderValue],
          };
        case app.$FunctionGesture.dragUp:
        case app.$FunctionGesture.dragDown:
          var offset =
            speed *
            (topBorderValue - bottomBorderValue) *
            (transformationType == app.$FunctionGesture.dragUp ? 1 : -1);
          var newBottomBorderValue = bottomBorderValue + offset;
          var newTopBorderValue = topBorderValue + offset;
          return {
            newDomX: [leftBorderValue, rightBorderValue],
            newDomY: [newBottomBorderValue, newTopBorderValue],
          };
      }
    }
  }

  inject("functionUtility", new FunctionUtility());
};
