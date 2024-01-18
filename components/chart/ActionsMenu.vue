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
        @open="handleOpenSidebar"
        @close="handleCloseSidebar"
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
        <vue-mathjax
          :formula="currentFunctionLatex"
          id="currentFormulaMathJax"
          tabindex="-1"
          class="mr-2"
        ></vue-mathjax>
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
          <b-button
            @click="changeFunction"
            v-shortkey.once="{ next: ['f'], previous: ['shift', 'f'] }"
            @shortkey="handleShortkey"
            >Switch funzione</b-button
          >
        </div>
      </div>
    </div>
    <ChartInteractionsMenu
      :initial-is-function-interaction-mode-enabled="
        isFunctionInteractionModeEnabled
      "
      :initialIsTTSEnabled="initialIsTTSEnabled"
      @onFunctionInteractionModeChange="handleIsFunctionInteractionEnableChange"
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
    "switchPredefinedFunction",
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
      functionInteractionEnabledUserChoice: null, //tiene a mente la preferenza esplicita dell'utente
      isFunctionInteractionModeEnabled: true, //default
      favoriteItems: [],
      currentCustomizableItems: [],
      favoritesBarRefreshKey: 0,
      currentFunctionLatex: "$$f(x) = $$",
      currentFunctionIntervalArith: null,
      lastCopyFunctionSuccess: false,
      showCopyAlert: false,
      predefinedFunctions: [
        "((((2)/(3))x^(3)-1)/(x^(2)))-3cos(x)",
        "[-3,0]x^2;[0,3]x;", //funzione a tratti
        "0",
        "3",
        "x+3",
        "(1/2)(x+3)",
        "-x+3",
        "x^4",
        "x^2",
        "(1/2)x^2",
        "(1/2)abs(x)",
        "sqrt(x)",
        "(x^2)/(x^2+1)",
      ],
      currentPredefinedFunction: null,
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
    handleShortkey(event) {
      switch (event.srcKey) {
        case "next":
          this.goToNextFunction(true);
          break;
        case "previous":
          this.goToNextFunction(false);
          break;
      }
    },
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
      const currentFunctionObj = this.$functionParser.parse(
        functionData.data.fn
      );
      if (this.$functionParser.isTraitFunction(currentFunctionObj)) {
        console.log("funzione a tratti");
        //TODO: gestire il caso in cui arriva una funzione a tratti
      } else {
        //se la funzione non è a tratti
        this.currentFunctionIntervalArith = functionData.data.fn;
      }
    },
    handleSaveFromFavoritesBar() {
      this.$refs.chartOptionsSidebar.saveAll();
    },
    handleOpenSidebar() {
      this.isFunctionInteractionModeEnabled = false;
    },
    handleCloseSidebar() {
      this.isFunctionInteractionModeEnabled =
        this.functionInteractionEnabledUserChoice ?? true;
    },
    handleIsFunctionInteractionEnableChange(isInteractionEnabled) {
      this.functionInteractionEnabledUserChoice = isInteractionEnabled;
      this.isFunctionInteractionModeEnabled = isInteractionEnabled;
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
    changeFunction(evt) {
      this.goToNextFunction(true);
    },
    getNextElement(array, element) {
      let index = _.indexOf(array, element);
      if (index === -1) return null;
      index = (index + 1) % array.length;
      return array[index];
    },
    getPreviousElement(array, element) {
      let index = _.indexOf(array, element);
      // debugger;
      if (index === -1) return null;
      index = (index - 1 + array.length) % array.length; //devo sommare array.length altrimenti il risultato potrebbe essere negativo
      return array[index];
    },
    goToNextFunction(shouldGoForward) {
      this.currentPredefinedFunction =
        this.currentPredefinedFunction === null
          ? this.predefinedFunctions[0]
          : shouldGoForward
          ? this.getNextElement(
              this.predefinedFunctions,
              this.currentPredefinedFunction
            )
          : this.getPreviousElement(
              this.predefinedFunctions,
              this.currentPredefinedFunction
            );
      this.$emit("switchPredefinedFunction", this.currentPredefinedFunction);
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
