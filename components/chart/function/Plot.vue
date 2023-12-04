<template>
  <div>
    <div
      v-mouseover="chartAreaHovered"
      class="d-flex flex-column w-100 h-100"
      id="functionContainer"
      ref="fnContainer"
      v-if="doesFunctionExists"
    >
      <div class="w-100 h-100" style="position: relative">
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
    "domainManuallyChanged",
    "beginFunctionInteractionRequest",
    "fnExplorationOutOfVisibleBounds",
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
      pendingUserInteractionTimer: null,
      lastFirstDerivativeSign: null,
      lastXSign: null,
      lastYSign: null,
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
          this.canEmitEventsForSonification = true;
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
          this.updateFunctionChart();
          this.calculateYForXAndNotify(this.currentFnXValue);
          if (!this.isCurrentXInDisplayedRange) {
            this.adjustXOutOfVisibleBoundsAndNotify(
              val.requestType == this.$FunctionAction.beginExplorationIncrement
                ? -1
                : 1
            );
          } else {
            this.setXInVisibleBoundsAndResumeNotifications(
              val.requestType == this.$FunctionAction.beginExplorationIncrement
                ? 1
                : -1
            );
          }
          await this.$soundFactory.enableSonifier();
          break;
        case this.$FunctionAction.endExploration:
          this.performEndExplorationOperations();
          break;
        case this.$FunctionAction.incrementStep:
        case this.$FunctionAction.decrementStep:
          const multiplier =
            val.requestType == this.$FunctionAction.incrementStep ? 1 : -1;
          this.currentFnXValue =
            this.currentFnXValue + this.sonificationStep * multiplier;
          this.calculateYForXAndNotify(this.currentFnXValue);
          this.updateFunctionChart();
          if (!this.isCurrentXInDisplayedRange) {
            this.adjustXOutOfVisibleBoundsAndNotify(
              val.requestType == this.$FunctionAction.incrementStep ? -1 : 1
            );
          } else {
            this.setXInVisibleBoundsAndResumeNotifications(
              val.requestType == this.$FunctionAction.incrementStep ? 1 : -1
            );
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
      if (_.isNil(this.pendingUserInteractionTimer)) {
        this.updateFunctionChart();
      }
    },
    xMousePointer(val) {
      this.currentFnXValue = val;
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
      this.currentFnXValue += this.sonificationStep * multiplier;
      this.$emit("needNotifyStatus", this.functionStatus);
      this.$emit("needPlayEarcon", {
        id: this.$AudioSample.displayedChartBorder,
        ignoreIsStillPlaying: true,
      });
      this.$emit("fnExplorationOutOfVisibleBounds", true);
    },
    setXInVisibleBoundsAndResumeNotifications(multiplier) {
      const xStep = this.sonificationStep / this.fnSamplesInDeltaX;
      this.$emit("fnExplorationOutOfVisibleBounds", false);
      console.log("xStep: " + xStep);
      const initialXToCheck =
        this.currentFnXValue - this.sonificationStep * multiplier;
      var currentCheckedX = initialXToCheck;
      while (currentCheckedX < this.currentFnXValue) {
        this.calculateAndNotifyRelevantValuesForX(currentCheckedX);
        currentCheckedX += xStep * multiplier;
      }
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
      const y = this.calculateYGivenX(x);
      if (_.isNaN(y)) {
        console.log("NaN per X: " + x);
        this.currentFnYValue = 0; //asse X
        this.$emit("needPlayEarcon", {
          id: this.$AudioSample.noYAtX,
          ignoreIsStillPlaying: false,
        });
        this.performEndExplorationOperations(false);
      }
      // if (_.isNil(this.fnSecondDerivative) || _.isNil(this.fnDerivative)) {
      //   return;
      // }

      // //Calcolo se a questo X abbiamo un minimo o un massimo locale
      // const firstDerivativeValueAtX = this.fnDerivative.evaluate({ x: x });

      // const currentDerivativeSign = this.$math.sign(firstDerivativeValueAtX);
      // if (_.isNil(this.lastFirstDerivativeSign)) {
      //   this.lastFirstDerivativeSign = currentDerivativeSign;
      // }
      // const hasDerivativeChangedSign =
      //   this.lastFirstDerivativeSign != currentDerivativeSign;

      // // const firstDerivativeTolerance = stepTolerance; //serve questa tolleranza trovata empiricamente perchè dal punto di vista della libreria che renderizza la funzione, l'asse x è comunque discretizzato e quindi difficilmente avrà tra i suoi valori esattamente == al mio valore

      // // console.log("valore derivata prima " + firstDerivativeValueAtX);

      // if (hasDerivativeChangedSign) {
      //   const secondDerivativeValueAtX = this.fnSecondDerivative.evaluate({
      //     x: x,
      //   });
      //   // console.log("valore derivata seconda " + secondDerivativeValueAtX);
      // }
      //Controllo se abbiamo un'intersezione con l'asse X o Y
      const currentYSign = this.$math.sign(y);
      const currentXSign = this.$math.sign(x);
      if (_.isNil(this.lastXSign)) {
        this.lastXSign = currentXSign;
      }
      if (_.isNil(this.lastYSign)) {
        this.lastYSign = currentYSign;
      }
      const checkXAxisIntersection = this.lastYSign != currentYSign;
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
      // this.lastFirstDerivativeSign = currentDerivativeSign;
      this.lastXSign = currentXSign;
      this.lastYSign = currentYSign;
    },
    createFnConfigObject() {
      let config = {
        target: "#root",
        width: this.fnContainerWidth,
        height: this.fnContainerHeight * 0.99,
        tip: {
          // xLine: true,
          renderer: function (x, y) {},
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
            // force the use of builtIn math, altrimenti su funzioni definite con function(scope) salta tutto
            graphType: "polyline",
            fn: this.fn,
            nSamples: this.fnSamples,
            derivative: {
              fn: _.isNil(this.fnDerivative)
                ? "0"
                : this.fnDerivative.toString(),
              updateOnMouseMove: false, //con true si vede la tangente
            },
          },
        ],
      };
      if (!_.isNil(this.currentFnXValue) && !_.isNil(this.currentFnYValue)) {
        config.data.push({
          points: [[this.currentFnXValue, this.currentFnYValue]],
          fnType: "points",
          color: "red",
          class: "pippo",
          graphType: "polyline",
        });
        // this.updateTitleWithCurrentCoordinates(config);
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
          this.$emit("fnExplorationOutOfVisibleBounds", false);
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
          // console.log(`mosso mouse y: ${event.y}`);
          // console.log(`mosso mouse x: ${event.x}`);
          this.yMousePointer = event.y;
          this.xMousePointer = event.x;
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
              this.pendingUserInteractionTimer = null;
            }.bind(this),
            100
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
      this.lastYSign = null;
      this.lastXSign = null; //metto a null altrimenti si innesca l'effetto di un grafico "circolare" in cui quando termino l'eslorazione ad un estremo del grafico quando riparto dall'inizio, per esempio con una batch exploration, il segno cambia
      this.$emit("needNotifyStatus", this.functionStatus);
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
