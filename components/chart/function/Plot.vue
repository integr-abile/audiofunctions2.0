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
        yPointerDistanceFromFunction: 0, //TODO: valorizzare correttamente quando riesco a prendere il valore con l'evento giusto sulla funzione
      };
    },
  },
  data() {
    return {
      fnContainerWidth: 0,
      fnContainerHeight: 0,
      currentFnXValue: 0,
      currentFnYValue: 0,
      fnPlotInstance: null,
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
          // console.log("hover fn plot");
          //quando la posizione del puntino sulla funzione viene aggiornata
          this.currentFnYValue = cx.y;
          this.currentFnXValue = cx.x;
          this.$emit("needNotifyStatus", this.functionStatus);
        }.bind(this)
      );
      this.fnPlotInstance.on("mouseover", function () {
        //TODO: valutare se tenere anche questo evento o mi basta il mousemove. Alla fine mi servirebbe solo per capire quanto il puntatore è distante dalla funzione
      });
      this.fnPlotInstance.on("mouseout", function () {
        this.yPointerDistanceFromFunction = 0; //essendo fuori dall'area del grafico col mouse non ha più senso sapere quanto sono distante dalla funzione
        console.log("mouseout");
        //TODO: intercettare "mouseover" e "mouseout" per avviare o fermare la sonificazione
      });
      this.fnPlotInstance.on("mousemove", function () {
        //TODO: intercettare "mousemove" per beccare la posizione del puntatore del mouse all'interno del grafico
      });
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
