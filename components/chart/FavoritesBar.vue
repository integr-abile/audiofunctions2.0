<template>
  <div class="d-flex flex-wrap justify-content-evenly">
    <ChartOption
      v-for="(item, index) in options"
      :key="index"
      :optionData="item.data"
      :optionComponent="mapTypeComponent[item.identifier]"
      :optionIdentifier="item.identifier"
    />
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
};
</script>
