<template>
  <div>
    <!-- <VueAnnouncer /> -->
    <h2 class="sr-only">Controlli rapidi</h2>
    <div aria-label="Controlli rapidi" role="toolbar" class="d-flex">
      <div class="mr-3">
        <input
          type="checkbox"
          id="enableFnCheckbox"
          v-model="isFunctionInteractionModeEnabled"
        />
        <label for="enableFnCheckbox" class="sr-only"
          >Interacción con la función a través del teclado</label
        >
        <label aria-hidden="true">Interacción con el teclado</label>
      </div>
      <div>
        <input type="checkbox" id="enableTTSCheckbox" v-model="isTTSEnabled" />
        <label aria-hidden="true">Síntesis vocal web</label>
        <label for="enableTTSCheckbox" class="sr-only"
          >Síntesis de voz web. Si tiene un lector de pantalla activo, desactive esta
          opción para evitar una superposición de voces</label
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
        this.$announcer.polite(
          newVal
            ? "Ahora, al explorar el gráfico de la función, puede interactuar con el teclado"
            : ""
        );
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
