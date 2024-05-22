<template>
  <div>
    <div
      v-mouseover="chartAreaHovered"
      class="d-flex flex-column w-100 h-100"
      id="functionContainer"
      ref="fnContainer"
      v-if="doesFunctionExists"
    >
      <div
        class="w-100 h-100"
        style="position: relative"
        @touchend="handleTouchEnd"
      >
        <resize-observer @notify="handleResize" :emitOnMount="true" />
        <b-overlay :show="shouldShowChartOverlay">
          <div
            ref="chartarea"
            role="application"
            tabindex="0"
            :aria-label="chartAriaLabel"
          >
            <div id="root" aria-hidden="true"></div>
          </div>
          <template #overlay>
            <div class="w-100 h-100">
              <p class="display-3 text-center">
                Premi un tasto qualsiasi per iniziare ad interagire col grafico
              </p>
            </div>
          </template>
        </b-overlay>
      </div>
    </div>
    <div class="h-100" v-else>
      <div class="d-flex h-100 justify-content-center align-items-center">
        <h2>Nessuna funzione inserita</h2>
      </div>
    </div>
    <Keypress
      v-if="shouldShowChartOverlay"
      key-event="keyup"
      :key-code="null"
      @success="handleRequestBeginInteraction"
    />
  </div>
</template>

<style lang="scss">
.function-plot {
  .graph {
    .line-1 {
      stroke-width: 10;
    }
  }
}
</style>

<script>
import functionPlot from "function-plot";
import _ from "lodash";
require("format-unicorn");

export default {
  emits: [
    "needNotifyStatus",
    "needPlayEarcon",
    "needNotifyMessage",
    "displayedIntervalChangeRequest",
    "beginFunctionInteractionRequest",
    "fnExplorationOutOfVisibleBounds",
    "instrumentChangeRequest",
  ],
  props: [
    "fn",
    "actionRequest",
    "sonificationStep",
    "domXRange",
    "domYRange",
    "isKeyboardInteractionEnabled",
  ],
  components: {
    Keypress: () => import("vue-keypress"),
  },
  computed: {
    doesFunctionExists() {
      return !_.isNil(this.fn);
    },
    chartAriaLabel() {
      return `area del grafico. ${
        this.isKeyboardInteractionEnabled
          ? ""
          : "L'interazione da tastiera è disabilitata. Non puoi esplorare il grafico coi comandi da tastiera"
      }`;
    },
    shouldShowChartOverlay() {
      return (
        this.chartAreaHovered &&
        !this.$soundFactory.isToneEngineStarted() &&
        !this.alreadyRequestedBeginFunctionInteraction
      );
    },
    functionStatus() {
      return {
        yFunctionValue: this.currentFnYValue,
        xFunctionValue: this.currentFnXValue,
        yPointerDistanceFromFunction: this.yPointerDistanceFromFunction,
        shouldSound:
          (this.canEmitEventsForSonification ||
            this.isBatchExplorationInProgress) &&
          this.isCurrentYInDisplayedRange,
      };
    },
    yPointerDistanceFromFunction() {
      return this.currentFnYValue - this.yMousePointer;
    },
    isCurrentYInDisplayedRange() {
      return (
        this.currentFnYValue >= this.domYRange[0] &&
        this.currentFnYValue < this.domYRange[1]
      );
    },
    isCurrentXInDisplayedRange() {
      return (
        this.currentFnXValue >= this.domXRange[0] &&
        this.currentFnXValue < this.domXRange[1]
      );
    },
    currentFunction() {
      return this.$functionParser.parse(this.fn);
    },
  },

  data() {
    return {
      fnContainerWidth: 0,
      fnContainerHeight: 0,
      currentFnXValue: 0,
      currentFnYValue: 0,
      fnPlotInstance: null,
      fnSamples: 0,
      chartAreaHovered: false,
      alreadyRequestedBeginFunctionInteraction: false,
      fnSamplesInDeltaX: 0,
      fnDerivative: null,
      fnSecondDerivative: null,
      yMousePointer: 0,
      xMousePointer: 0,
      canEmitEventsForSonification: false,
      isBatchExplorationInProgress: false,
      isManualExplorationInProgress: false,
      batchSonificationTimeSeconds:
        process.env.SONIFICATION_BATCH_SONIFICATION_TIME_SECONDS,
      minSonificationTimeSeconds:
        process.env.SONIFICATION_MIN_TICK_TIME_SECONDS,
      batchSonificationTimer: null,
      currentEarconToPlay: null,
      explorationIndicatorColor: "#e86432", //rossiccio
      // pendingUserInteractionTimer: null,
      lastFirstDerivativeSign: null,
      lastXSign: null,
      lastYSign: null,
      isExploringThroughKeyboard: false,
    };
  },
  watch: {
    fnContainerWidth: {
      handler(newVal) {
        this.fnSamples = this.estimateFunctionNumberOfSamples();
        this.updateFunctionChart();
      },
      immediate: true,
    },
    fnContainerHeight: {
      handler(newVal) {
        this.updateFunctionChart();
      },
      immediate: true,
    },
    fnSamples(val) {
      this.fnSamplesInDeltaX = this.calculateNumberOfSamplesInDeltaX(
        this.sonificationStep,
        this.domXRange,
        val
      );
    },
    domXRange(val) {
      this.fnSamplesInDeltaX = this.calculateNumberOfSamplesInDeltaX(
        this.sonificationStep,
        val,
        this.fnSamples
      );
    },
    sonificationStep(val) {
      this.fnSamplesInDeltaX = this.calculateNumberOfSamplesInDeltaX(
        val,
        this.domXRange,
        this.fnSamples
      );
    },
    async actionRequest(val) {
      console.log(`richiesta azione ${val.requestType}`);
      switch (val.requestType) {
        case this.$FunctionAction.beginExplorationIncrement:
        case this.$FunctionAction.beginExplorationDecrement:
          this.isBatchExplorationInProgress = false;
          this.isManualExplorationInProgress = true;
          this.isExploringThroughKeyboard = true;
          // this.canEmitEventsForSonification = true;
          this.$emit("fnExplorationOutOfVisibleBounds", true);
          if (_.isNil(this.currentFnXValue)) {
            this.currentFnXValue = this.domXRange[0];
          } else {
            if (
              val.requestType == this.$FunctionAction.beginExplorationIncrement
            ) {
              this.currentFnXValue += this.sonificationStep;
            } else {
              this.currentFnXValue -= this.sonificationStep;
            }
          }
          // this.updateFunctionChart();
          if (!this.isCurrentXInDisplayedRange) {
            this.adjustXOutOfVisibleBoundsAndNotify(
              val.requestType == this.$FunctionAction.beginExplorationIncrement
                ? -1
                : 1
            );
          } else {
            this.calculateYForXAndNotify(this.currentFnXValue);
          }
          // this.updateFunctionChart();
          await this.$soundFactory.enableSonifier();
          break;
        case this.$FunctionAction.endExploration:
          this.performEndExplorationOperations();
          break;
        case this.$FunctionAction.incrementStep:
        case this.$FunctionAction.decrementStep:
          if (val.requestType == this.$FunctionAction.incrementStep) {
            this.currentFnXValue += this.sonificationStep;
          } else {
            this.currentFnXValue -= this.sonificationStep;
          }
          if (!this.isCurrentXInDisplayedRange) {
            this.adjustXOutOfVisibleBoundsAndNotify(
              val.requestType == this.$FunctionAction.beginExplorationIncrement
                ? -1
                : 1
            );
          } else {
            this.calculateYForXAndNotify(this.currentFnXValue);
          }
          break;
        case this.$FunctionAction.goToBegin:
          this.currentFnXValue = this.domXRange[0];
          this.calculateYForXAndNotify(this.currentFnXValue);
          break;
        case this.$FunctionAction.goToEnd:
          this.currentFnXValue = this.domXRange[1] - 0.000001;
          this.calculateYForXAndNotify(this.currentFnXValue);
          break;
        case this.$FunctionAction.batchExploration:
          if (this.isBatchExplorationInProgress) {
            this.performEndExplorationOperations();
            if (!_.isNil(this.batchSonificationTimer)) {
              clearTimeout(this.batchSonificationTimer);
            }
            // return;
          }
          this.$emit("fnExplorationOutOfVisibleBounds", true);
          this.isBatchExplorationInProgress = true;
          const xDomainTicksToNotifyCount =
            (this.domXRange[1] - this.domXRange[0]) / this.sonificationStep;
          let notificationIntervalTimeSeconds =
            this.batchSonificationTimeSeconds / xDomainTicksToNotifyCount;
          if (
            notificationIntervalTimeSeconds < this.minSonificationTimeSeconds
          ) {
            notificationIntervalTimeSeconds = this.minSonificationTimeSeconds;
          }
          this.lastXSign = null;
          this.currentFnXValue = this.domXRange[0]; //inizio sonificando il primo valore della funzione

          let sonifyTick = function () {
            if (
              this.isBatchExplorationInProgress &&
              this.currentFnXValue < this.domXRange[1]
            ) {
              this.$emit("fnExplorationOutOfVisibleBounds", false);

              this.currentFnXValue += this.sonificationStep;
              this.calculateYForXAndNotify(this.currentFnXValue);
              // this.updateFunctionChart();

              this.batchSonificationTimer = setTimeout(
                sonifyTick,
                notificationIntervalTimeSeconds * 1000
              );
            } else {
              clearTimeout(this.batchSonificationTimer);
              this.isBatchExplorationInProgress = false;
              this.canEmitEventsForSonification = false;
              this.updateFunctionChart();
              this.$emit("needNotifyStatus", this.functionStatus);
              this.$emit("needPlayEarcon", {
                id: this.$AudioSample.displayedChartBorder,
                ignoreIsStillPlaying: true,
              });
              this.$emit("fnExplorationOutOfVisibleBounds", true);
              this.performEndExplorationOperations();
            }
          }.bind(this);
          sonifyTick();
          break;
        case this.$FunctionAction.currentCoordinatesRequest:
          this.notifyTextMessage(
            this.$TextToSpeechOption.coordinates,
            this.$FunctionVoiceMessageFormat.currentCoordinates.formatUnicorn({
              x: `${this.currentFnXValue.toFixed(2)}`,
              y: `${this.currentFnYValue.toFixed(2)}`,
            })
          );
          break;
        case this.$FunctionAction.currentXIntervalRequest:
          this.notifyTextMessage(
            this.$TextToSpeechOption.intervals,
            this.$FunctionVoiceMessageFormat.interval.formatUnicorn({
              axis: "x",
              min: this.domXRange[0],
              max: this.domXRange[1],
            })
          );
          break;
        case this.$FunctionAction.currentYIntervalRequest:
          this.notifyTextMessage(
            this.$TextToSpeechOption.intervals,
            this.$FunctionVoiceMessageFormat.interval.formatUnicorn({
              axis: "y",
              min: this.domYRange[0],
              max: this.domYRange[1],
            })
          );
          break;
        case this.$FunctionAction.readCurrentExpression:
          this.$nextTick(() => {
            let el = document.getElementById("currentFormulaMathJax");
            el.blur(); //rimuove il focus
            setTimeout(() => {
              el.focus();
            }, 500); //do un po' di tempo per risettarlo perchè altrimenti se premo F o shift+F senza aver lasciato l'ultimo focus, lo SR non legge l'aggiornamento
          });
          break;
        case this.$FunctionAction.zoomIn:
          this.$emit("displayedIntervalChangeRequest", {
            requestType: this.$FunctionGesture.zoomIn,
            pivotPoint: {
              x: this.currentFnXValue,
              y: this.currentFnYValue,
            },
          });
          break;
        case this.$FunctionAction.zoomOut:
          this.$emit("displayedIntervalChangeRequest", {
            requestType: this.$FunctionGesture.zoomOut,
            pivotPoint: {
              x: this.currentFnXValue,
              y: this.currentFnYValue,
            },
          });
          break;
        case this.$FunctionAction.dragRight:
          this.$emit("displayedIntervalChangeRequest", {
            requestType: this.$FunctionGesture.dragRight,
            pivotPoint: {
              x: this.currentFnXValue,
              y: this.currentFnYValue,
            },
          });
          break;
        case this.$FunctionAction.dragLeft:
          this.$emit("displayedIntervalChangeRequest", {
            requestType: this.$FunctionGesture.dragLeft,
            pivotPoint: {
              x: this.currentFnXValue,
              y: this.currentFnYValue,
            },
          });
          break;
        case this.$FunctionAction.dragUp:
          this.$emit("displayedIntervalChangeRequest", {
            requestType: this.$FunctionGesture.dragUp,
            pivotPoint: {
              x: this.currentFnXValue,
              y: this.currentFnYValue,
            },
          });
          break;
        case this.$FunctionAction.dragDown:
          this.$emit("displayedIntervalChangeRequest", {
            requestType: this.$FunctionGesture.dragDown,
            pivotPoint: {
              x: this.currentFnXValue,
              y: this.currentFnYValue,
            },
          });
          break;
        case this.$FunctionAction.changeInstrument:
          this.$emit("instrumentChangeRequest");
          break;
        default:
          break;
      }
    },
    fn(val) {
      // this.fnDerivative = this.$math.derivative(val, "x");
      // this.fnSecondDerivative = this.$math.derivative(this.fnDerivative, "x");
      this.updateFunctionChart();
    },
    domXRange(val) {
      this.updateFunctionChart();
    },
    domYRange(val) {
      this.updateFunctionChart();
    },
    currentFnXValue(val) {
      if (_.isNil(this.fnPlotInstance)) {
        return;
      }
      this.calculateAndNotifyRelevantValuesForX(val);
      this.calculateYForXAndNotify(this.currentFnXValue);
      this.updateFunctionChart();
      // if (_.isNil(this.pendingUserInteractionTimer)) {

      // }
    },
    xMousePointer(val) {
      this.currentFnXValue = val;
    },
    canEmitEventsForSonification(val) {
      this.$emit("needNotifyStatus", this.functionStatus);
    },
  },
  methods: {
    handleResize({ width, height }) {
      this.fnContainerWidth = width;
      this.fnContainerHeight = height;
    },
    notifyTextMessage(type, message) {
      this.$emit("needNotifyMessage", {
        type: type,
        message: message,
      });
    },
    handleRequestBeginInteraction() {
      this.alreadyRequestedBeginFunctionInteraction = true;
      this.$emit("beginFunctionInteractionRequest");
    },
    //Multiplier deve'essere 1 o -1
    adjustXOutOfVisibleBoundsAndNotify(multiplier) {
      console.log("correcting x on bounds");
      this.currentFnXValue += this.sonificationStep * multiplier;
      this.$emit("needNotifyStatus", this.functionStatus);
      this.$emit("needPlayEarcon", {
        id: this.$AudioSample.displayedChartBorder,
        ignoreIsStillPlaying: true,
      });
      this.$emit("fnExplorationOutOfVisibleBounds", true);
    },
    isYInDisplayedRange(y) {
      return y >= this.domYRange[0] && y < this.domYRange[1];
    },
    estimateFunctionNumberOfSamples() {
      const pixelDensity = window.devicePixelRatio || 1;
      const estimation = this.fnContainerWidth * pixelDensity;
      return estimation + (estimation / 100) * 20; //Aggiungo un 20% per sicurezza ad una stima che già dovrebbe essere sufficiente
    },
    calculateNumberOfSamplesInDeltaX(deltaX, domX, totalNumberOfSamples) {
      return (deltaX / (domX[1] - domX[0])) * totalNumberOfSamples;
    },
    calculateAndNotifyRelevantValuesForX(x) {
      const currentXSign = this.$math.sign(x);
      console.log("X sign " + currentXSign);
      if (_.isNil(this.lastXSign)) {
        this.lastXSign = currentXSign;
      }
      const checkYAxisIntersection = this.lastXSign != currentXSign;

      if (checkYAxisIntersection) {
        console.log("intersezione con asse Y");
        const yAt0 = this.calculateYGivenX(0);
        if (this.isYInDisplayedRange(yAt0)) {
          this.$emit("needPlayEarcon", {
            id: this.$AudioSample.yAxisIntersection,
            ignoreIsStillPlaying: true,
          });
        }
      }
      this.lastXSign = currentXSign;
    },

    createFnConfigObject() {
      let functionsData = [];
      if (this.$functionParser.isTraitFunction(this.currentFunction)) {
        const traits = this.currentFunction.traits.forEach((trait) => {
          functionsData.push({
            graphType: "polyline",
            fn: trait.function,
            range: [trait.lowerBound, trait.upperBound],
            skipTip: true,
            nSamples: this.nSamples,
          });
        });
      } else {
        //La funzione è non a tratti
        functionsData.push({
          graphType: "polyline",
          fn: this.currentFunction.fn,
          skipTip: true,
          nSamples: this.nSamples,
        });
      }
      //Inserimento indicatore X corrente
      if (!_.isNil(this.currentFnXValue) && !_.isNil(this.currentFnYValue)) {
        const currentXIndicator = {
          //via CSS aggiungo la width
          points: [[this.currentFnXValue, this.currentFnYValue]],
          skipTip: true,
          fnType: "points",
          color: "red",
          class: "pippo",
          graphType: "polyline",
        };
        functionsData.length <= 1
          ? functionsData.push(currentXIndicator)
          : functionsData.splice(1, 0, currentXIndicator);
      }

      let config = {
        target: "#root",
        disableZoom: true,
        width: this.fnContainerWidth,
        height: this.fnContainerHeight * 0.99,
        yAxis: {
          domain: this.domYRange,
        },
        xAxis: {
          domain: this.domXRange,
        },
        grid: true,
        data: functionsData,
      };
      return config;
    },

    handleTouchEnd() {
      this.handleRequestBeginInteraction();
    },
    updateFunctionChart() {
      console.log("updating chart");
      this.fnPlotInstance = functionPlot(this.createFnConfigObject());
      this.fnPlotInstance.on(
        "tip:update",
        function (cx, cy, cidx) {
          console.log("tip:update");
          this.isBatchExplorationInProgress = false;
          this.currentFnYValue = cx.y;
          this.currentFnXValue = cx.x;
          this.$emit("fnExplorationOutOfVisibleBounds", false);
          this.notifyCurrentXYPositionIfNeeded();
        }.bind(this)
      );
      this.fnPlotInstance.on(
        "mouseout",
        function (event) {
          console.log("mouseout");
          this.canEmitEventsForSonification = false;
          this.$emit("needNotifyStatus", this.functionStatus);
          this.$emit("needPlayEarcon", {
            id: this.$AudioSample.displayedChartBorder,
            ignoreIsStillPlaying: false,
          });
          this.$emit("fnExplorationOutOfVisibleBounds", true);
        }.bind(this)
      );
      this.fnPlotInstance.on(
        "mousemove",
        function (event) {
          this.isExploringThroughKeyboard = false;
          this.yMousePointer = event.y;
          this.xMousePointer = event.x;
        }.bind(this)
      );

      this.fnPlotInstance.on("all:zoom", function (event) {
        //è l'unico modo che ho per intercettare la mouse wheel

        console.log("scrolling " + event); //da event posso ricavare deltaY e capire se sto scrollando su o giù
      });
    },
    notifyCurrentXYPositionIfNeeded() {
      if (this.canEmitEventsForSonification) {
        this.$emit("needNotifyStatus", this.functionStatus);
        if (!this.isCurrentYInDisplayedRange) {
          console.log("notify noYAtX. Ignore still playing: false");
          this.$emit("needPlayEarcon", {
            id: this.$AudioSample.noYAtX,
            ignoreIsStillPlaying: false,
          });
        }
      }
    },

    calculateYGivenX(x) {
      const fn = this.$functionParser.getFunctionForX(x, this.currentFunction);
      if (_.isNil(fn)) {
        return NaN;
      }
      return functionPlot.$eval.builtIn(
        {
          fn: this.$functionParser.getFunctionForX(x, this.currentFunction),
        },
        "fn",
        {
          x: x,
        }
      );
    },
    calculateYForXAndNotify(x) {
      const y = this.calculateYGivenX(x);
      if (_.isNaN(y)) {
        console.log("NaN per X: " + x);
        this.currentFnYValue = 0; //asse X
        this.$emit("needPlayEarcon", {
          id: this.$AudioSample.noYAtX,
          ignoreIsStillPlaying: false,
        });
        this.canEmitEventsForSonification = false;
        return;
      }
      this.canEmitEventsForSonification = true;

      const currentYSign = this.$math.sign(y);
      if (_.isNil(this.lastYSign)) {
        this.lastYSign = currentYSign;
      }
      this.lastYSign = currentYSign;
      if (this.isExploringThroughKeyboard) {
        this.yMousePointer = y;
      }
      this.currentFnYValue = y;
      this.$emit("needNotifyStatus", this.functionStatus);
      if (!this.isCurrentYInDisplayedRange) {
        this.$emit("needPlayEarcon", {
          id: this.$AudioSample.noYAtX,
          ignoreIsStillPlaying: false,
        });
      }
    },
    // updateTitleWithCurrentCoordinates(fnPlotConfigObj) {
    //   fnPlotConfigObj.title = `X: ${this.currentFnXValue.toFixed(
    //     3
    //   )}, Y: ${this.currentFnYValue.toFixed(3)}`;
    // },
    performEndExplorationOperations(shouldUpdateChart = true) {
      this.isManualExplorationInProgress = false;
      this.canEmitEventsForSonification = false;
      // this.$emit("needNotifyStatus", this.functionStatus);
      this.$emit("fnExplorationOutOfVisibleBounds", true);
      if (shouldUpdateChart) {
        this.updateFunctionChart();
      }
    },
  },
};
</script>
<style lang="scss">
.function-plot {
  .top-right-legend {
    display: none;
  }
}
</style>
