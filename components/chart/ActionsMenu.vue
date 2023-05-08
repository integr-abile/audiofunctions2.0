<template>
  <div class="container-fluid">
    <div class="d-flex align-items-center w-100 mb-2">
      <b-button v-b-toggle.options-sidebar>Opzioni</b-button>
      <ChartOptionsSidebar
        ref="chartOptionsSidebar"
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
            aria-label="Copia formula latex"
            title="Copia formula latex"
            v-clipboard:copy="currentFunctionLatex"
            v-clipboard:success="onCopy"
            v-clipboard:error="onCopyError"
          >
            <b-icon-files></b-icon-files>
          </b-button>
        </div>
      </div>
      <!-- Area alert-->
      <b-alert
        v-model="showCopyAlert"
        :variant="lastCopyFunctionSuccess ? 'success' : 'danger'"
        dismissible
        aria-live="polite"
        aria-atomic="true"
      >
        {{
          this.lastCopyFunctionSuccess ? "Copiato" : "Errore durante la copia"
        }}
      </b-alert>
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
      :initialIsTTSEnabled="initialIsTTSEnabled"
      @onFunctionInteractionModeChange="
        (isInteractionEnabled) =>
          (isFunctionInteractionModeEnabled = isInteractionEnabled)
      "
      @onTTSEnabledChange="
        (isTextToSpeechEnabled) =>
          $emit('ttsEnableStatusChange', isTextToSpeechEnabled)
      "
    />
    <ChartFavoritesBar
      :key="favoritesBarRefreshKey"
      v-if="favoriteItems.length > 0"
      :options="sortedFavorites"
      :mapTypeComponent="mapTypeComponent"
      @saveChanges="handleSaveFromFavoritesBar"
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
import OptionTTS from "../option/TTS.vue";
import _ from "lodash";

export default {
  emits: [
    "saveChanges",
    "userInteraction",
    "ttsEnableStatusChange",
    "functionInteractionEnableStatusChange",
    "customizableItemsConfigurationChange",
  ],
  props: {
    customizableItems: {
      //ogni elemento sarà tipo {identifier:"optionId",data:{}, isFavorite: true}
      type: Array,
      default() {
        return [];
      },
    },
    initialIsTTSEnabled: false,
  },
  computed: {
    mapTypeComponent() {
      return {
        xDomain: OptionXDomain,
        yDomain: OptionYDomain,
        function: OptionFunction,
        sonification: OptionSonification,
        tts: OptionTTS,
      };
    },
    sortedFavorites() {
      return _.sortBy(this.favoriteItems, ["identifier"]);
    },
  },
  data() {
    return {
      isFunctionInteractionModeEnabled: true, //default
      favoriteItems: [],
      currentCustomizableItems: [],
      favoritesBarRefreshKey: 0,
      currentFunctionLatex: "$$f(x) = $$",
      currentFunctionIntervalArith: null,
      lastCopyFunctionSuccess: false,
      showCopyAlert: false,
    };
  },
  watch: {
    isFunctionInteractionModeEnabled(val) {
      this.$emit("functionInteractionEnableStatusChange", val);
    },
    customizableItems(val) {
      this.updateCurrentCustomizableItems(val);
    },
    currentCustomizableItems(val) {
      this.$emit("customizableItemsConfigurationChange", val);
    },
    currentFunctionIntervalArith(val) {
      this.currentFunctionLatex =
        "$$f(x) = " +
        this.$functionValidator.toLatex(this.currentFunctionIntervalArith) +
        "$$";
    },
  },
  created() {
    this.updateCurrentCustomizableItems(this.customizableItems);

    // debugger;
  },
  methods: {
    updateCurrentCustomizableItems(newConfiguration) {
      this.currentCustomizableItems = _.cloneDeep(newConfiguration); //bisognare fare un deep clone altrimenti non mi fa una copia anche degli elementi contenuti nell'array
      this.favoriteItems = _.filter(this.currentCustomizableItems, {
        isFavorite: true,
      });
      const functionData = _.head(
        _.filter(newConfiguration, function (item) {
          return item.identifier == "function";
        })
      );
      this.currentFunctionIntervalArith = functionData.data.fn;
    },
    handleSaveFromFavoritesBar() {
      this.$refs.chartOptionsSidebar.saveAll();
    },
    onCopy(evt) {
      this.lastCopyFunctionSuccess = true;
      this.showCopyAlert = true;
      console.log("copia ok " + evt.text);
    },
    onCopyError(evt) {
      this.lastCopyFunctionSuccess = false;
      this.showCopyAlert = true;
      console.error("errore copia");
    },
    handleSaveChanges(optionIdentifiers) {
      console.log(`handleSaveChanges for ${optionIdentifiers}`);
      const itemsSaved = _.filter(
        this.currentCustomizableItems,
        function (item) {
          return _.includes(optionIdentifiers, item.identifier);
        }
      );
      this.updateCurrentCustomizableItems(this.currentCustomizableItems);
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
