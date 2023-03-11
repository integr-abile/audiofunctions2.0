<template>
  <component :is="optionComponent" :data="currentOptionData" />
</template>

<script>
export default {
  props: ["optionIdentifier", "optionData", "optionComponent"],
  data() {
    return {
      currentOptionData: this.optionData,
    };
  },
};
</script>
