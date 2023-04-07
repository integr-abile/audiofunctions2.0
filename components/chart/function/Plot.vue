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

        <div role="application" tabindex="0" aria-label="area del grafico">
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

export default {
  emits: ["needNotifyStatus", "needPlayEarcon"],
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
      yMousePointer: 0,
      canEmitEventsForSonification: false,
      isBatchExplorationInProgress: false,
      batchSonificationTimeSeconds:
        process.env.SONIFICATION_BATCH_SONIFICATION_TIME_SECONDS,
      minSonificationTimeSeconds:
        process.env.SONIFICATION_MIN_TICK_TIME_SECONDS,
      batchSonificationTimer: null,
      currentEarconToPlay: null,
    };
  },
  watch: {
    fnContainerWidth: {
      handler(newVal) {
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
    actionRequest(val) {
      console.log(`richiesta azione ${val.requestType}`);
      switch (val.requestType) {
        case this.$FunctionAction.beginExploration:
          this.isBatchExplorationInProgress = false;
          this.currentFnXValue = this.currentFnXValue ?? this.domXRange[0];
          this.calculateYForXAndNotify(this.currentFnXValue);
        case this.$FunctionAction.endExploration:
          break;
        case this.$FunctionAction.incrementStep:
          this.currentFnXValue += this.sonificationStep;
          this.calculateYForXAndNotify(this.currentFnXValue);
          if (!this.isCurrentXInDisplayedRange) {
            this.$emit("needPlayEarcon", {
              id: this.$AudioSample.displayedChartBorder,
              ignoreIsStillPlaying: true,
            });
            //se la x nuova sonificata è però fuori range riporto la X ad essere dentro il range e notifico il bordo del grafico
            this.currentFnXValue -= this.sonificationStep;
          }
          break;
        case this.$FunctionAction.decrementStep:
          this.currentFnXValue -= this.sonificationStep;
          this.calculateYForXAndNotify(this.currentFnXValue);
          if (!this.isCurrentXInDisplayedRange) {
            this.$emit("needPlayEarcon", {
              id: this.$AudioSample.displayedChartBorder,
              ignoreIsStillPlaying: true,
            });
            //se la x nuova sonificata è però fuori range riporto la X ad essere dentro il range
            this.currentFnXValue += this.sonificationStep;
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

              this.currentFnXValue += this.sonificationStep;
              this.batchSonificationTimer = setTimeout(
                sonifyTick,
                notificationIntervalTimeSeconds * 1000
              );
            } else {
              clearTimeout(this.batchSonificationTimer);
              this.isBatchExplorationInProgress = false;
              this.$emit("needNotifyStatus", this.functionStatus);
              this.$emit("needPlayEarcon", {
                id: this.$AudioSample.displayedChartBorder,
                ignoreIsStillPlaying: true,
              });
              // this.$soundFactory.playSample(
              //   this.$AudioSample.displayedChartBorder
              // );
            }
          }.bind(this);
          sonifyTick();
          break;
      }
    },
    fn(val) {
      this.updateFunctionChart();
    },
    domXRange(val) {
      this.updateFunctionChart();
    },
    domYRange(val) {
      this.updateFunctionChart();
    },
  },
  methods: {
    handleResize({ width, height }) {
      this.fnContainerWidth = width;
      this.fnContainerHeight = height;
    },

    updateFunctionChart() {
      this.fnPlotInstance = functionPlot({
        target: "#root",
        width: this.fnContainerWidth,
        height: this.fnContainerHeight * 0.99,
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
          },
        ],
      });
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
    calculateYForXAndNotify(x) {
      const y = functionPlot.$eval.builtIn(
        {
          fn: this.fn,
        },
        "fn",
        {
          x: x,
        }
      );
      // debugger;
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
