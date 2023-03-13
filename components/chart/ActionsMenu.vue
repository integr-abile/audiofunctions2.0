<template>
  <div class="container-fluid">
    <div class="d-flex w-100">
      <b-button v-b-toggle.options-sidebar>Opzioni</b-button>
      <ChartOptionsSidebar
        sidebar-id="options-sidebar"
        :customizableOptions="customizableItems"
        :mapTypeComponent="mapTypeComponent"
        @optionStateChange="handleOptionStateChange"
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
      @onFunctionInteractionModeChange="
        (isInteractionEnabled) =>
          (isFunctionInteractionModeEnabled = isInteractionEnabled)
      "
    />
    <ChartFavoritesBar
      v-if="favoriteItems.length > 0"
      :options="favoriteItems"
      :mapTypeComponent="mapTypeComponent"
    />
    <ChartFunctionShortcuts v-if="isFunctionInteractionModeEnabled" />
  </div>
</template>

<script>
import OptionXDomain from "../option/XDomain.vue";
import OptionYDomain from "../option/YDomain.vue";
import _ from "lodash";

export default {
  props: {
    customizableItems: {
      //ogni elemento sarà tipo {identifier:"optionId",data:{}, isFavorite: true}
      type: Array,
      default() {
        return [];
      },
    },
  },
  computed: {
    mapTypeComponent() {
      return {
        xDomain: OptionXDomain,
        yDomain: OptionYDomain,
      };
    },
  },
  data() {
    return {
      isFunctionInteractionModeEnabled: false,
      favoriteItems: [],
    };
  },
  methods: {
    handleOptionStateChange(evtData) {
      evtData.isFavorite
        ? this.addToFavoriteItemIfNeeded(evtData)
        : this.removeFromFavoriteItemsIfNeeded(evtData.identifier);
    },
    addToFavoriteItemIfNeeded(optionData) {
      const existingFavoriteItem = _.find(this.favoriteItems, {
        identifier: optionData.identifier,
      });
      if (existingFavoriteItem == null) {
        this.favoriteItems.push(optionData);
      }
    },
    removeFromFavoriteItemsIfNeeded(optionIdentifier) {
      this.favoriteItems = _.filter(this.favoriteItems, function (item) {
        return item.identifier != optionIdentifier;
      });
    },
  },
};
</script>

<style></style>
