<template>
  <div>
    <div aria-label="Controlli rapidi" role="toolbar" class="d-flex">
      <div class="mr-3">
        <input
          type="checkbox"
          id="enableFnCheckbox"
          v-model="isFunctionInteractionModeEnabled"
        />
        <label for="enableFnCheckbox" class="sr-only"
          >Interazione con la funzione tramite tastiera</label
        >
        <label aria-hidden="true">Interazione tramite tastiera</label>
      </div>
      <div>
        <input type="checkbox" id="enableTTSCheckbox" v-model="isTTSEnabled" />
        <label aria-hidden="true">Sintesi vocale web</label>
        <label for="enableTTSCheckbox" class="sr-only"
          >Sintesi vocale web. Se hai uno screen reader attivo disabilita questa
          opzione per evitare una sovrapposizione di voci</label
        >
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
    isFunctionInteractionEnabled: {
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
