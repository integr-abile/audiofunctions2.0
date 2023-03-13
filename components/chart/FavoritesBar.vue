<template>
  <div>
    <div class="d-flex flex-wrap justify-content-evenly">
      <div
        v-for="(item, index) in options"
        :key="index"
        class="p-2 rounded border border-2 mr-2"
      >
        <ChartOption
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
};
</script>
