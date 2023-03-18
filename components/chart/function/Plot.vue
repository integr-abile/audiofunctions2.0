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
  props: ["fn", "dummy"],
  computed: {
    doesFunctionExists() {
      return !_.isNil(this.fn);
    },
  },
  data() {
    return {
      fnContainerWidth: 0,
      fnContainerHeight: 0,
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
    fn(val) {
      this.updateFunctionChart();
    },
  },
  methods: {
    handleResize({ width, height }) {
      this.fnContainerWidth = width;
      this.fnContainerHeight = height;
    },
    updateFunctionChart() {
      const fnPlotInstance = functionPlot({
        target: "#root",
        width: this.fnContainerWidth,
        height: this.fnContainerHeight * 0.99,
        grid: true,
        data: [
          {
            fn: this.fn,
          },
        ],
      });
      //TODO: setup listeners su istanza functionPlot
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
