<template>
  <div>
    <div
      class="d-flex flex-column w-100 h-100"
      id="functionContainer"
      ref="fnContainer"
      v-if="doesFunctionExists"
    >
      <div class="w-100 h-100" style="position: relative">
        <resize-observer @notify="handleResize" :emitOnMount="true" />

        <div
          ref="chartarea"
          role="application"
          tabindex="0"
          aria-label="area del grafico"
        >
          <div id="root" aria-hidden="true"></div>
        </div>
      </div>
    </div>
    <div class="h-100" v-else>
      <div class="d-flex h-100 justify-content-center align-items-center">
        <h2>Nessuna funzione inserita</h2>
      </div>
    </div>
  </div>
</template>

<script>
import functionPlot from "function-plot";
import _ from "lodash";
require("format-unicorn");

export default {
  emits: [
    "needNotifyStatus",
    "needPlayEarcon",
    "needNotifyMessage",
    "domainManuallyChanged",
  ],
  props: ["fn", "actionRequest", "sonificationStep", "domXRange", "domYRange"],
  computed: {
    doesFunctionExists() {
      return !_.isNil(this.fn);
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
      return Math.abs(this.currentFnYValue - this.yMousePointer);
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
  },
  data() {
    return {
      fnContainerWidth: 0,
      fnContainerHeight: 0,
      currentFnXValue: 0,
      currentFnYValue: 0,
      fnPlotInstance: null,
      fnSamples: 0,
      fnSamplesInDeltaX: 0,
      fnDerivative: null,
      fnSecondDerivative: null,
      yMousePointer: 0,
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
      pendingUserInteractionTimer: null,
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
    actionRequest(val) {
      console.log(`richiesta azione ${val.requestType}`);
      switch (val.requestType) {
        case this.$FunctionAction.beginExploration:
          this.isBatchExplorationInProgress = false;
          this.isManualExplorationInProgress = true;
          this.currentFnXValue = this.currentFnXValue ?? this.domXRange[0];
          this.calculateYForXAndNotify(this.currentFnXValue);
          this.updateFunctionChart();
          break;
        case this.$FunctionAction.endExploration:
          this.isManualExplorationInProgress = false;
          this.updateFunctionChart();
          break;
        case this.$FunctionAction.incrementStep:
          this.currentFnXValue += this.sonificationStep;
          this.calculateYForXAndNotify(this.currentFnXValue);
          this.updateFunctionChart();

          if (!this.isCurrentXInDisplayedRange) {
            this.$emit("needPlayEarcon", {
              id: this.$AudioSample.displayedChartBorder,
              ignoreIsStillPlaying: true,
            });
            //se la x nuova sonificata è però fuori range riporto la X ad essere dentro il range e notifico il bordo del grafico
            this.currentFnXValue -= this.sonificationStep;
          } else {
            const xStep = this.sonificationStep / this.fnSamplesInDeltaX;
            console.log("xStep: " + xStep);
            const initialXToCheck =
              this.currentFnXValue - this.sonificationStep;
            var currentCheckedX = initialXToCheck;
            while (currentCheckedX < this.currentFnXValue) {
              this.calculateAndNotifyRelevantValuesForX(currentCheckedX);
              currentCheckedX += xStep;
            }
          }
          break;
        case this.$FunctionAction.decrementStep:
          this.currentFnXValue -= this.sonificationStep;
          this.calculateYForXAndNotify(this.currentFnXValue);
          this.updateFunctionChart();
          if (!this.isCurrentXInDisplayedRange) {
            this.$emit("needPlayEarcon", {
              id: this.$AudioSample.displayedChartBorder,
              ignoreIsStillPlaying: true,
            });
            //se la x nuova sonificata è però fuori range riporto la X ad essere dentro il range
            this.currentFnXValue += this.sonificationStep;
          } else {
            const xStep = this.sonificationStep / this.fnSamplesInDeltaX;
            const initialXToCheck =
              this.currentFnXValue + this.sonificationStep;
            var currentCheckedX = initialXToCheck;
            while (currentCheckedX > this.currentFnXValue) {
              this.calculateAndNotifyRelevantValuesForX(currentCheckedX);
              currentCheckedX -= xStep;
            }
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
            return;
          }
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
          this.currentFnXValue = this.domXRange[0]; //inizio sonificando il primo valore della funzione
          let sonifyTick = function () {
            if (
              this.isBatchExplorationInProgress &&
              this.currentFnXValue < this.domXRange[1]
            ) {
              this.calculateYForXAndNotify(this.currentFnXValue);
              this.updateFunctionChart();
              this.currentFnXValue += this.sonificationStep;
              this.batchSonificationTimer = setTimeout(
                sonifyTick,
                notificationIntervalTimeSeconds * 1000
              );
            } else {
              clearTimeout(this.batchSonificationTimer);
              this.isBatchExplorationInProgress = false;
              this.updateFunctionChart();
              this.$emit("needNotifyStatus", this.functionStatus);
              this.$emit("needPlayEarcon", {
                id: this.$AudioSample.displayedChartBorder,
                ignoreIsStillPlaying: true,
              });
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
        default:
          break;
      }
    },
    fn(val) {
      this.fnDerivative = this.$math.derivative(val, "x");
      this.fnSecondDerivative = this.$math.derivative(this.fnDerivative, "x");
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
    estimateFunctionNumberOfSamples() {
      const pixelDensity = window.devicePixelRatio || 1;
      const estimation = this.fnContainerWidth * pixelDensity;
      return estimation + (estimation / 100) * 20; //Aggiungo un 20% per sicurezza ad una stima che già dovrebbe essere sufficiente
    },
    calculateNumberOfSamplesInDeltaX(deltaX, domX, totalNumberOfSamples) {
      return (deltaX / (domX[1] - domX[0])) * totalNumberOfSamples;
    },
    calculateAndNotifyRelevantValuesForX(x) {
      const y = this.calculateYGivenX(x);
      if (_.isNil(this.fnSecondDerivative) || _.isNil(this.fnDerivative)) {
        return;
      }
      const stepTolerance = 0.05;
      //Calcolo se a questo X abbiamo un minimo o un massimo locale
      const firstDerivativeValueAtX = this.fnDerivative.evaluate({ x: x });
      const firstDerivativeTolerance = stepTolerance; //serve questa tolleranza trovata empiricamente perchè dal punto di vista della libreria che renderizza la funzione, l'asse x è comunque discretizzato e quindi difficilmente avrà tra i suoi valori esattamente == al mio valore

      // console.log("valore derivata prima " + firstDerivativeValueAtX);

      if (
        firstDerivativeValueAtX > -firstDerivativeTolerance &&
        firstDerivativeValueAtX < firstDerivativeTolerance
      ) {
        const secondDerivativeValueAtX = this.fnSecondDerivative.evaluate({
          x: x,
        });
        this.notifyTextMessage(
          this.$TextToSpeechOption.maxMin,
          secondDerivativeValueAtX > 0
            ? this.$FunctionVoiceMessageFormat.localMin
            : this.$FunctionVoiceMessageFormat.localMax
        );
        console.log("valore derivata seconda " + secondDerivativeValueAtX);
      }
      //Controllo se abbiamo un'intersezione con l'asse X o Y
      const checkXAxisIntersection = y > -stepTolerance && y < stepTolerance;
      const checkYAxisIntersection = x > -stepTolerance && x < stepTolerance;
      if (checkXAxisIntersection || checkYAxisIntersection) {
        var message = "";
        if (checkXAxisIntersection) {
          message += this.$FunctionVoiceMessageFormat.intersectX;
          if (checkYAxisIntersection) {
            message += ` e ${this.$FunctionVoiceMessageFormat.intersectY}`;
          }
          this.notifyTextMessage(
            this.$TextToSpeechOption.axisIntersections,
            message
          );
          // this.$emit("needNotifyMessage", message);
        } else {
          if (checkYAxisIntersection) {
            this.notifyTextMessage(
              this.$TextToSpeechOption.axisIntersections,
              this.$FunctionVoiceMessageFormat.intersectY
            );
            // this.$emit(
            //   "needNotifyMessage",
            //   this.$FunctionVoiceMessageFormat.intersectY
            // );
          }
        }
      }
    },
    createFnConfigObject() {
      let config = {
        target: "#root",
        width: this.fnContainerWidth,
        height: this.fnContainerHeight * 0.99,
        tip: {
          xLine: true,
          renderer: function (x, y) {
            return `(${x.toFixed(2)}, ${y.toFixed(2)})`;
          },
        },
        yAxis: {
          domain: this.domYRange,
        },
        xAxis: {
          domain: this.domXRange,
        },
        grid: true,
        data: [
          {
            fn: this.fn,
            nSamples: this.fnSamples,
            derivative: {
              fn: _.isNil(this.fnDerivative)
                ? "0"
                : this.fnDerivative.toString(),
              updateOnMouseMove: true,
            },
          },
        ],
      };
      if (
        this.isBatchExplorationInProgress ||
        this.isManualExplorationInProgress
      ) {
        config.data.push({
          points: [
            [this.currentFnXValue, this.domYRange[0]],
            [this.currentFnXValue, this.domYRange[1]],
          ],
          fnType: "points",
          color: "red",
          graphType: "polyline",
        });
      }

      // debugger;
      return config;
    },

    updateFunctionChart() {
      if (!_.isNil(this.fnPlotInstance)) {
        const svg = document.querySelector("#root svg");
        if (!_.isNil(svg)) {
          while (svg.lastChild) {
            svg.removeChild(svg.lastChild);
          }
        }
      }
      this.fnPlotInstance = functionPlot(this.createFnConfigObject());
      this.fnPlotInstance.on(
        "tip:update",
        function (cx, cy, cidx) {
          console.log("tip:update");
          this.isBatchExplorationInProgress = false;
          this.currentFnYValue = cx.y;
          this.currentFnXValue = cx.x;
          this.notifyCurrentXYPositionIfNeeded();
        }.bind(this)
      );
      this.fnPlotInstance.on(
        "mouseover",
        function (event) {
          console.log("mouseover");
          this.canEmitEventsForSonification = true;
          //Non emetto un evento se no mi riparte dall'ultimo tip:update, mentre è solo il tip:update che può comandare la posizione X,Y
        }.bind(this)
      );
      this.fnPlotInstance.on(
        "mouseout",
        function (event) {
          console.log("mouseout");
          this.canEmitEventsForSonification = false;
          this.$emit("needPlayEarcon", {
            id: this.$AudioSample.displayedChartBorder,
            ignoreIsStillPlaying: false,
          });
          // this.$soundFactory.playSample(
          //   this.$AudioSample.displayedChartBorder,
          //   false
          // );
          this.$emit("needNotifyStatus", this.functionStatus);
        }.bind(this)
      );
      this.fnPlotInstance.on(
        "mousemove",
        function (event) {
          // console.log(`mosso mouse y: ${event.y}`);
          this.yMousePointer = event.y;
        }.bind(this)
      );

      this.fnPlotInstance.on(
        "all:zoom",
        function (event) {
          //scale o translation
          console.log(
            "numero di campioni " + this.estimateFunctionNumberOfSamples()
          );
          // const newXAxisDomain = this.fnPlotInstance.meta.xDomain;
          const newXAxisDomain = this.fnPlotInstance.meta.xScale.domain();
          const newYAxisDomain = this.fnPlotInstance.meta.yScale.domain();

          if (!_.isNil(this.pendingUserInteractionTimer)) {
            clearTimeout(this.pendingUserInteractionTimer);
          }
          this.pendingUserInteractionTimer = setTimeout(
            function () {
              console.log(
                `evt ${event.type}. new x axis domain: ${newXAxisDomain}; y domain: ${newYAxisDomain}`
              );
              this.$emit("domainManuallyChanged", [
                {
                  identifier: "xDomain",
                  data: {
                    xMin: newXAxisDomain[0],
                    xMax: newXAxisDomain[1],
                  },
                },
                {
                  identifier: "yDomain",
                  data: {
                    yMin: newYAxisDomain[0],
                    yMax: newYAxisDomain[1],
                  },
                },
              ]);
            }.bind(this),
            1000
          );

          // debugger;
        }.bind(this)
      );
    },
    notifyCurrentXYPositionIfNeeded() {
      if (this.canEmitEventsForSonification) {
        this.$emit("needNotifyStatus", this.functionStatus);
        if (!this.isCurrentYInDisplayedRange) {
          this.$emit("needPlayEarcon", {
            id: this.$AudioSample.noYAtX,
            ignoreIsStillPlaying: false,
          });
          // this.$soundFactory.playSample(this.$AudioSample.noYAtX, false);
        }
      }
    },
    calculateYGivenX(x) {
      return functionPlot.$eval.builtIn(
        {
          fn: this.fn,
        },
        "fn",
        {
          x: x,
        }
      );
    },
    calculateYForXAndNotify(x) {
      const y = this.calculateYGivenX(x);
      this.yMousePointer = y;
      this.currentFnYValue = y;

      this.$emit("needNotifyStatus", this.functionStatus);
      if (!this.isCurrentYInDisplayedRange) {
        this.$emit("needPlayEarcon", {
          id: this.$AudioSample.noYAtX,
          ignoreIsStillPlaying: true,
        });
        // this.$soundFactory.playSample(this.$AudioSample.noYAtX);
      }
    },
    setFocusOnFunction() {
      this.$refs.chartarea.focus();
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
