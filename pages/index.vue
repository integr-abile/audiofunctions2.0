<template>
  <div id="app" class="p-2 border border-gray-500 d-flex flex-column">
    <label class="block mb-2 font-bold"> Prova grafico </label>
    <FunctionPlot id="fnPlot" class="h-100 d-flex flex-column" />

    <!-- <button @click="changeChartData">Change data</button> -->
  </div>
</template>

<script>
export default {
  data() {
    return {
      chartDataValues: [40, 39, 10, 40, 39, 80, 40],
    };
  },

  computed: {
    chartData() {
      return {
        labels: [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
        ],
        datasets: [
          {
            label: "Data One",
            backgroundColor: "#f87979",
            data: this.chartDataValues,
          },
        ],
      };
    },
  },
  methods: {
    changeChartData() {
      this.chartDataValues = this.chartDataValues.sort(
        (a, b) => 0.5 - Math.random()
      );
    },
  },
};
</script>
<style>
html,
body,
#app,
#__nuxt,
#__layout {
  margin: 0;
  height: 100%;
  overflow: hidden;
}
body {
  --keyboard-zindex: 3000;
}
</style>
