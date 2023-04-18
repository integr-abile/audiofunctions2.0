<template>
  <div>
    <div class="d-flex">
      <div class="mr-3">
        <input
          type="checkbox"
          id="enableFnCheckbox"
          v-model="isFunctionInteractionModeEnabled"
        />
        <label for="enableFnCheckbox">Interazione tramite tastiera</label>
      </div>
      <div>
        <input type="checkbox" id="enableTTSCheckbox" v-model="isTTSEnabled" />
        <label for="enableTTSCheckbox">Sintesi vocale web</label>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  emits: ["onFunctionInteractionModeChange", "onTTSEnabledChange"],
  props: {
    initialIsFunctionInteractionModeEnabled: {
      type: Boolean,
      default: false,
    },
    initialIsTTSEnabled: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      isFunctionInteractionModeEnabled:
        this.initialIsFunctionInteractionModeEnabled,
      isTTSEnabled: this.initialIsTTSEnabled,
    };
  },
  watch: {
    isFunctionInteractionModeEnabled: {
      handler(newVal) {
        // console.log(`emit ${newVal}`);
        this.$emit("onFunctionInteractionModeChange", newVal);
      },
    },
    isTTSEnabled: {
      handler(newVal) {
        // console.log(`emit ${newVal}`);
        this.$emit("onTTSEnabledChange", newVal);
      },
    },
  },
};
</script>
