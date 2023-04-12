<template>
  <div class="container-fluid">
    <div class="d-flex align-items-center w-100 mb-2">
      <b-button v-b-toggle.options-sidebar>Opzioni</b-button>
      <ChartOptionsSidebar
        sidebar-id="options-sidebar"
        :customizableOptions="currentCustomizableItems"
        :mapTypeComponent="mapTypeComponent"
        @optionStateChange="handleOptionStateChange"
        @optionDataChange="handleOptionDataChange"
        @saveChanges="handleSaveChanges"
      />
      <div class="d-flex justify-content-end mx-3" style="flex: 1">
        <div class="d-flex align-items-center">
          <span
            class="mr-2 font-weight-bold text-info"
            style="text-decoration: underline"
          >
            Funzione corrente:
          </span>
        </div>
        <vue-mathjax :formula="currentFunctionLatex" class="mr-2"></vue-mathjax>
        <div class="d-flex align-items-center">
          <b-button
            variant="outline-secondary"
            size="sm"
            title="Copia formula latex"
          >
            <b-icon-files></b-icon-files>
          </b-button>
        </div>
      </div>
      <div class="d-flex justify-content-end">
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
      :key="favoritesBarRefreshKey"
      v-if="favoriteItems.length > 0"
      :options="sortedFavorites"
      :mapTypeComponent="mapTypeComponent"
    />
    <ChartFunctionShortcuts
      :isFunctionInteractionEnabled="isFunctionInteractionModeEnabled"
      v-if="isFunctionInteractionModeEnabled"
      @actionRequest="(evt) => $emit('userInteraction', evt)"
    />
  </div>
</template>

<script>
import OptionXDomain from "../option/XDomain.vue";
import OptionYDomain from "../option/YDomain.vue";
import OptionFunction from "../option/Function.vue";
import OptionSonification from "../option/Sonification.vue";
import _ from "lodash";

export default {
  emits: ["saveChanges", "userInteraction"],
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
        function: OptionFunction,
        sonification: OptionSonification,
      };
    },
    sortedFavorites() {
      return _.sortBy(this.favoriteItems, ["identifier"]);
    },
  },
  data() {
    return {
      isFunctionInteractionModeEnabled: false,
      favoriteItems: [],
      currentCustomizableItems: [],
      favoritesBarRefreshKey: 0,
      currentFunctionLatex: "$$f(x) = \\frac{3}{4}$$",
    };
  },
  created() {
    this.currentCustomizableItems = _.cloneDeep(this.customizableItems); //bisognare fare un deep clone altrimenti non mi fa una copia anche degli elementi contenuti nell'array
    this.favoriteItems = _.filter(this.currentCustomizableItems, {
      isFavorite: true,
    });
    // debugger;
  },
  methods: {
    handleSaveChanges(optionIdentifiers) {
      console.log(`handleSaveChanges for ${optionIdentifiers}`);
      const itemsSaved = _.filter(
        this.currentCustomizableItems,
        function (item) {
          return _.includes(optionIdentifiers, item.identifier);
        }
      );
      this.$emit(
        "saveChanges",
        _.map(itemsSaved, function (obj) {
          return _.omit(obj, ["isFavorite"]); //isFavorite non serve come informazione al grafico
        })
      );
    },
    handleOptionStateChange(evtData) {
      evtData.isFavorite
        ? this.addToFavoriteItemIfNeeded(evtData)
        : this.removeFromFavoriteItemsIfNeeded(evtData.identifier);
    },
    handleOptionDataChange(evtData) {
      const idx = _.findIndex(this.currentCustomizableItems, function (item) {
        return item.identifier == evtData.optionIdentifier;
      });
      this.currentCustomizableItems[idx].data = evtData.optionData;

      const favIdx = _.findIndex(this.favoriteItems, function (item) {
        return item.identifier == evtData.optionIdentifier;
      });
      if (favIdx == -1) {
        return;
      }
      this.favoriteItems[favIdx].data = evtData.optionData;
      this.favoritesBarRefreshKey += 1;
    },
    addToFavoriteItemIfNeeded(optionData) {
      const idx = _.findIndex(this.currentCustomizableItems, function (item) {
        return item.identifier == optionData.identifier;
      });
      this.currentCustomizableItems[idx].isFavorite = true;
      const existingFavoriteItem = _.find(this.favoriteItems, {
        identifier: optionData.identifier,
      });
      if (existingFavoriteItem == null) {
        this.favoriteItems.push(optionData);
      }
    },
    removeFromFavoriteItemsIfNeeded(optionIdentifier) {
      const idx = _.findIndex(this.currentCustomizableItems, function (item) {
        return item.identifier == optionIdentifier;
      });
      this.currentCustomizableItems[idx].isFavorite = false;

      this.favoriteItems = _.filter(this.favoriteItems, function (item) {
        return item.identifier != optionIdentifier;
      });
    },
  },
};
</script>

<style></style>
