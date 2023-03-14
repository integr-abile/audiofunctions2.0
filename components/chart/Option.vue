<template>
  <component :is="optionComponent" :optionData="currentOptionData" />
</template>

<script>
export default {
  props: ["optionIdentifier", "optionData", "optionComponent"],
  data() {
    return {
      currentOptionData: {},
    };
  },
  created() {
    this.currentOptionData = this.optionData;
  },
};
</script>
