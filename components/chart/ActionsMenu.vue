<template>
  <div class="container-fluid">
    <div class="d-flex w-100">
      <b-button v-b-toggle.options-sidebar>Opzioni</b-button>
      <ChartOptionsSidebar
        sidebar-id="options-sidebar"
        :customizableOptionsData="customizableItems"
      />
      <div class="d-flex justify-content-end w-100">
        <div class="d-grid gap-3">
          <!-- TODO: gestire popup istruzioni e keymap-->
          <b-button v-b-modal.instruction-modal>Istruzioni</b-button>
          <ChartInstructionModal modal-id="instruction-modal" />
          <b-button v-b-modal.keymap-modal>Keymap</b-button>
          <ChartKeybindingModal modal-id="keymap-modal" />
        </div>
      </div>
    </div>
    <ChartInteractionsMenu
      :initial-is-function-interaction-mode-enabled="
        isFunctionInteractionModeEnabled
      "
      @onFunctionInteractionModeChange="onFunctionInteractionModeChange"
    />
    <ChartFavoritesBar v-if="Object.keys(favoriteItems).length > 0" />
    <ChartFunctionShortcuts v-if="isFunctionInteractionModeEnabled" />
  </div>
</template>

<script>
export default {
  props: {
    customizableItems: {
      //sarà tipo {identifier:"optionId",data:{}}
      type: Array,
      default() {
        return [];
      },
    },
  },
  data() {
    return {
      isFunctionInteractionModeEnabled: false,
      favoriteItems: {},
    };
  },
  methods: {
    onFunctionInteractionModeChange(isFunctionInteractionModeEnabled) {
      this.isFunctionInteractionModeEnabled = isFunctionInteractionModeEnabled;
    },
  },
};
</script>

<style></style>
