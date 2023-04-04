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
  emits: ["needNotifyStatus"],
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
          this.canEmitEventsForSonification ||
          this.isBatchExplorationInProgress,
      };
    },
    yPointerDistanceFromFunction() {
      return Math.abs(this.currentFnYValue - this.yMousePointer);
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
    canEmitEventsForSonification(val) {
      this.$emit("needNotifyStatus", this.functionStatus);
    },
    actionRequest(val) {
      console.log(`richiesta azione ${val.requestType}`);
      switch (val.requestType) {
        case this.$FunctionAction.beginExploration:
          break;
        case this.$FunctionAction.endExploration:
          break;
        case this.$FunctionAction.incrementStep:
          break;
        case this.$FunctionAction.decrementStep:
          break;
        case this.$FunctionAction.goToBegin:
          break;
        case this.$FunctionAction.goToEnd:
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
              const y = functionPlot.$eval.builtIn(
                {
                  fn: this.fn,
                },
                "fn",
                {
                  x: this.currentFnXValue,
                }
              );
              // debugger;
              this.yMousePointer = y;
              this.currentFnYValue = y;
              console.log(
                `batch sonification x:${this.currentFnXValue} y:${this.currentFnYValue}`
              );
              //TODO: controllare se Y sta nel dominio visualizzato altrimenti fare qualcosa
              if (y >= this.domYRange[0] && y < this.domYRange[1]) {
                this.$emit("needNotifyStatus", this.functionStatus);
              }
              this.currentFnXValue += this.sonificationStep;
              this.batchSonificationTimer = setTimeout(
                sonifyTick,
                notificationIntervalTimeSeconds * 1000
              );
            } else {
              clearTimeout(this.batchSonificationTimer);
              this.isBatchExplorationInProgress = false;
              this.$emit("needNotifyStatus", this.functionStatus);
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
          this.isBatchExplorationInProgress = false;
          this.currentFnYValue = cx.y;
          this.currentFnXValue = cx.x;
          if (this.canEmitEventsForSonification) {
            this.$emit("needNotifyStatus", this.functionStatus);
          }
        }.bind(this)
      );
      this.fnPlotInstance.on(
        "mouseover",
        function (event) {
          console.log("mouseover");
          this.canEmitEventsForSonification = true;
        }.bind(this)
      );
      this.fnPlotInstance.on(
        "mouseout",
        function (event) {
          console.log("mouseout");
          this.canEmitEventsForSonification = false;
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
