<template>
  <div>
    <div class="d-flex flex-wrap justify-content-evenly">
      <div
        v-for="(item, index) in options"
        :key="index"
        class="p-2 rounded border border-2 mr-2"
        style="min-width: 250px"
      >
        <ChartOption
          :key="componentKey"
          :optionData="item.data"
          :optionComponent="mapTypeComponent[item.identifier]"
          :optionIdentifier="item.identifier"
        />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    options: {
      type: Array,
      default() {
        return [];
      },
    },
    mapTypeComponent: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      componentKey: 0, //variabile usata per indicare la necessità di refreshare il componente ChartOption
    };
  },
  watch: {
    options(val) {
      console.log("favorite bar changed");
      this.componentKey += 1;
    },
  },
};
</script>
