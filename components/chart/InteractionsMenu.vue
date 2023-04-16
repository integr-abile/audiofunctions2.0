<template>
  <div>
    <input
      type="checkbox"
      id="enableFnCheckbox"
      v-model="isFunctionInteractionModeEnabled"
    />
    <label for="enableFnCheckbox">Interazione tramite tastiera</label>
  </div>
</template>

<script>
export default {
  emits: ["onFunctionInteractionModeChange"],
  props: {
    initialIsFunctionInteractionModeEnabled: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      isFunctionInteractionModeEnabled:
        this.initialIsFunctionInteractionModeEnabled,
    };
  },
  watch: {
    isFunctionInteractionModeEnabled: {
      handler(newVal) {
        console.log(`emit ${newVal}`);
        this.$emit("onFunctionInteractionModeChange", newVal);
      },
    },
  },
};
</script>
