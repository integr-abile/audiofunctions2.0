<template>
  <div id="app" class="p-2 border border-gray-500 d-flex flex-column">
    <label class="block mb-2 font-bold"> Prova grafico </label>
    <FunctionPlot id="fnPlot" class="h-100 d-flex flex-column" />

    <!-- <button @click="changeChartData">Change data</button> -->
  </div>
</template>

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
