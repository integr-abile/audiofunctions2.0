<template>
  <div
    class="h-100 d-flex flex-column"
    v-visibility-change="onChartAreaVisibilityChange"
  >
    <VueAnnouncer />
    <ChartSonifier
      v-bind="functionSonificationData"
      :isEnabled="functionSonificationOptions.isEnabled"
      :instrument="functionSonificationOptions.instrument"
      :domXRange="functionSonificationOptions.domXRange"
      :domYRange="functionSonificationOptions.domYRange"
      :earconObj="earconToNotifyObj"
      :shouldResetState="isFnExplorationOutOfBounds"
      :isMute="isMute"
    />
    <header>
      <ChartActionsMenu
        ref="actionMenu"
        :customizableItems="initialConfiguration"
        :isMute="isMute"
        @saveChanges="onOptionsChangesSaved"
        @switchPredefinedFunction="onSwitchPredefinedFunction"
        @userInteraction="handleFunctionActionRequest"
        @functionInteractionEnableStatusChange="
          (isFunctionInteractionEnabled) =>
            (isFnInteractionEnabled = isFunctionInteractionEnabled)
        "
        @customizableItemsConfigurationChange="
          (newConfig) => (currentConfiguration = newConfig)
        "
        @audioOutStatusChange="handleAudioOutStatusChange"
      />
    </header>

    <label
      v-if="liveMessage"
      for="monitor"
      class="d-flex justify-content-center"
    >
      <output class="p-2" style="border-style: solid" id="monitor">{{
        liveMessage
      }}</output>
    </label>

    <main class="h-100" aria-label="Grafico della funzione" tabindex="0">
      <ChartFunctionPlot
        v-bind="functionOptions"
        :actionRequest="functionActionRequest"
        :isKeyboardInteractionEnabled="isFnInteractionEnabled"
        id="fnPlot"
        ref="fnPlot"
        class="h-100"
        @needNotifyStatus="handleFunctionStateNotification"
        @needPlayEarcon="(earconObj) => (earconToNotifyObj = earconObj)"
        @fnExplorationOutOfVisibleBounds="
          (userFnExplorationOutOfVisibleBounds) =>
            (isFnExplorationOutOfBounds = userFnExplorationOutOfVisibleBounds)
        "
        @needNotifyMessage="handleFunctionMessageEvent"
        @displayedIntervalChangeRequest="handleDisplayedIntervalChangeRequest"
        @beginFunctionInteractionRequest="handleEvent"
        @instrumentChangeRequest="handleInstrumentChangeRequest"
      />
    </main>
    <footer>
      <p style="font-size: 12px">v{{ version }}</p>
    </footer>
  </div>
</template>

<script>
import _ from "lodash";
import appVersion from "~/assets/version.js";

export default {
  layout: "fullscreen",
  data() {
    return {
      lastTimeTextToReadChanged: null,
      chartActionMenuRefreshKey: 0,
      lastPendingMessageToRead: "",
      functionOptions: {},
      initialConfiguration: [],
      currentConfiguration: [],
      functionActionRequest: null, //oggetto del tipo {requestType: enum, repetition: 1}
      fnTextRepresentation: "",
      isFnInteractionEnabled: true, //questa variabile dev'essere mantenuta sincronizzata con quella nell'interaction bar come valore di default. Quando la sidebar è aperta gli shortcut per la funzione sono disabilitati
      lastFunctionActionRequestType: null,
      functionSonificationData: {},
      functionSonificationOptions: {},
      isFnExplorationOutOfBounds: false,
      earconToNotifyObj: {},
      version: appVersion,
      isMute: false,
      liveMessage: "",
    };
  },
  created() {
    window.addEventListener("keydown", this.handleEvent);
    window.addEventListener("mousedown", this.handleEvent);
    //Deserializzazione URL per configurazione iniziale
    const sessionDataSerializer = this.$sessionDataSerializer;
    // this.startMonitoringMessageQueue();
    const initialEncodedConfiguration =
      this.$route.query[sessionDataSerializer.sessionDataQueryParamKey];
    if (initialEncodedConfiguration == null) {
      this.initialConfiguration = this.defaultConfiguration;
      return;
    }
    try {
      //La sintassi dell'initialConfiguration è quella del customizableItems
      const configOverrides = sessionDataSerializer.parse(
        initialEncodedConfiguration
      );
      let defaultConfig = _.cloneDeep(this.defaultConfiguration);
      configOverrides.forEach((cfgOverride) => {
        const identifier = cfgOverride.identifier;
        cfgOverride.params.forEach((param) => {
          _.find(defaultConfig, { identifier: identifier }).data[param.id] =
            param.value;
        });
      });
      console.log(defaultConfig);
      this.initialConfiguration = defaultConfig;
    } catch (e) {
      this.initialConfiguration = this.defaultConfiguration;
      alert(e.message);
    }
  },
  beforeDestroy() {
    window.removeEventListener("keydown", this.handleEvent);
    window.removeEventListener("mousedown", this.handleEvent);
  },
  mounted() {
    this.isSonificationEnabled = true;
  },
  watch: {
    initialConfiguration(val) {
      this.currentConfiguration = val;
      this.valorizeFunctionParamsFromOptions(val);
    },
  },
  computed: {
    defaultConfiguration() {
      //questa variabile non cambia mai e sarà quella da ricavare dai query params
      return [
        {
          identifier: "function",
          data: {
            fn: "sin(x)", //formato interval arithmetic
          },
          isFavorite: false,
        },
        {
          identifier: "xDomain",
          data: {
            xMin: -16, //stessi di geogebra
            xMax: 16, //stessi di geogebra
            step: 0.5,
          },
          isFavorite: false,
        },
        {
          identifier: "yDomain",
          data: {
            yMin: -9, //stessi di geogebra
            yMax: 9, //stessi di geogebra
            step: 1,
          },
          isFavorite: false,
        },
        {
          identifier: "sonification",
          data: {
            availableInstruments: this.$soundFactory.getAllInstrumentsName(),
            selectedInstrument: "clarinet",
            isEnabled: true,
          },
          isFavorite: false,
        },
      ];
    },
  },
  methods: {
    async handleEvent(evt) {
      if (!this.$soundFactory.isToneEngineStarted()) {
        this.$soundFactory.enableSonifier();
      }
    },
    handleAudioOutStatusChange(event) {
      this.isMute = event;
      console.log("audio out status changed " + event);
    },
    onChartAreaVisibilityChange(evt, hidden) {
      console.log("hidden " + hidden);
      const newFunctionSonificationOptions = _.cloneDeep(
        this.functionSonificationOptions
      );
      newFunctionSonificationOptions.isEnabled = !hidden;
      this.functionSonificationOptions = newFunctionSonificationOptions;
    },
    handleInstrumentChangeRequest(event) {
      const allAvailableInstruments =
        this.$soundFactory.getAllInstrumentsName();
      const currentInstrumentIndex = allAvailableInstruments.indexOf(
        this.functionSonificationOptions.instrument
      );
      const nextInstrumentIndex =
        (currentInstrumentIndex + 1) % allAvailableInstruments.length;
      const newInstrument = allAvailableInstruments[nextInstrumentIndex];
      this.functionSonificationOptions = {
        ...this.functionSonificationOptions,
        instrument: newInstrument,
      };
      this.updateInstrumentInConfiguration(newInstrument);
    },
    handleDisplayedIntervalChangeRequest(event) {
      const requestType = event.requestType.split("-")[0];
      console.log("request type " + requestType);
      const speed =
        requestType == "zoom"
          ? this.$FunctionGesture.ZoomSpeed.medium
          : this.$FunctionGesture.DragSpeed.medium;

      const { newDomX, newDomY } =
        this.$functionUtility.calculateNewVisualizedInterval(
          this.functionOptions.domXRange,
          this.functionOptions.domYRange,
          event.pivotPoint,
          event.requestType,
          speed
        );
      console.log("nuovo intervallo visualizzato " + newDomX + " " + newDomY);
      this.functionOptions = {
        ...this.functionOptions,
        domXRange: newDomX,
        domYRange: newDomY,
      };
      this.functionSonificationOptions = {
        ...this.functionSonificationOptions,
        domXRange: newDomX,
        domYRange: newDomY,
      };
      this.updateXDomainInConfiguration(newDomX);
      this.updateYDomainInConfiguration(newDomY);
    },

    updateFunctionInConfiguration(newFn) {
      const idxOfFn = _.findIndex(this.currentConfiguration, {
        identifier: "function",
      });
      this.currentConfiguration[idxOfFn].data.fn = newFn;
      this.currentConfiguration = _.cloneDeep(this.currentConfiguration);
      this.$refs.actionMenu.updateCurrentCustomizableItems(
        this.currentConfiguration
      );
    },

    updateInstrumentInConfiguration(newInstrument) {
      const idxOfInstrument = _.findIndex(this.currentConfiguration, {
        identifier: "sonification",
      });
      this.currentConfiguration[idxOfInstrument].data.selectedInstrument =
        newInstrument;
      this.currentConfiguration = _.cloneDeep(this.currentConfiguration);
      this.$refs.actionMenu.updateCurrentCustomizableItems(
        this.currentConfiguration
      );
    },

    updateXDomainInConfiguration(newDomain) {
      const idxOfDomain = _.findIndex(this.currentConfiguration, {
        identifier: "xDomain",
      });
      this.currentConfiguration[idxOfDomain].data.xMin = newDomain[0];
      this.currentConfiguration[idxOfDomain].data.xMax = newDomain[1];
      this.currentConfiguration = _.cloneDeep(this.currentConfiguration);
      this.$refs.actionMenu.updateCurrentCustomizableItems(
        this.currentConfiguration
      );
    },

    updateYDomainInConfiguration(newDomain) {
      const idxOfDomain = _.findIndex(this.currentConfiguration, {
        identifier: "yDomain",
      });
      this.currentConfiguration[idxOfDomain].data.yMin = newDomain[0];
      this.currentConfiguration[idxOfDomain].data.yMax = newDomain[1];
      this.currentConfiguration = _.cloneDeep(this.currentConfiguration);
      this.$refs.actionMenu.updateCurrentCustomizableItems(
        this.currentConfiguration
      );
    },

    onOptionsChangesSaved(optionsChanged) {
      //[{"identifier": "xDomain","data": {}]

      console.log(`options changed to: ${optionsChanged}`);
      this.valorizeFunctionParamsFromOptions(optionsChanged);
    },
    onSwitchPredefinedFunction(newFn) {
      console.log(`cambiata funzione predefinita ${newFn}`);
      // debugger;
      const newFunctionOptions = _.cloneDeep(this.functionOptions);
      newFunctionOptions.fn = newFn;
      this.functionOptions = newFunctionOptions;
      this.updateFunctionInConfiguration(newFn);
      this.$nextTick(() => {
        let el = document.getElementById("currentFormulaMathJax");
        if (el) {
          el.blur(); //rimuove il focus
          setTimeout(() => {
            el.focus();
          }, 500); //do un po' di tempo per risettarlo perchè altrimenti se premo F o shift+F senza aver lasciato l'ultimo focus, lo SR non legge l'aggiornamento
        }
      });
    },
    valorizeFunctionParamsFromOptions(options) {
      const functionData = _.head(
        _.filter(options, function (item) {
          return item.identifier == "function";
        })
      );
      const xDomainData = _.head(
        _.filter(options, function (item) {
          return item.identifier == "xDomain";
        })
      );
      const yDomainData = _.head(
        _.filter(options, function (item) {
          return item.identifier == "yDomain";
        })
      );
      const sonificationData = _.head(
        _.filter(options, function (item) {
          return item.identifier == "sonification";
        })
      );
      const ttsData = _.head(
        _.filter(options, function (item) {
          return item.identifier == "tts";
        })
      );
      // debugger;
      this.functionOptions = {
        fn: _.isNil(functionData)
          ? this.functionOptions.fn
          : functionData.data.fn,
        sonificationStep: _.isNil(xDomainData)
          ? this.functionOptions.sonificationStep
          : parseFloat(xDomainData.data.step),
        domXRange: _.isNil(xDomainData)
          ? this.functionOptions.domXRange
          : [parseInt(xDomainData.data.xMin), parseInt(xDomainData.data.xMax)],
        domYRange: _.isNil(yDomainData)
          ? this.functionOptions.domYRange
          : [parseInt(yDomainData.data.yMin), parseInt(yDomainData.data.yMax)],
      };
      // debugger;
      this.functionSonificationOptions = {
        isEnabled: _.isNil(sonificationData)
          ? this.functionSonificationOptions.isEnabled
          : sonificationData.data.isEnabled,
        instrument: _.isNil(sonificationData)
          ? this.functionSonificationOptions.instrument
          : sonificationData.data.selectedInstrument,
        domXRange: this.functionOptions.domXRange,
        domYRange: this.functionOptions.domYRange,
      };
    },
    handleFunctionActionRequest(requestType) {
      this.functionActionRequest = {
        requestType: requestType,
        repetition:
          requestType == this.lastFunctionActionRequestType
            ? this.functionActionRequest.repetition + 1
            : 1,
      };
      this.lastFunctionActionRequestType = requestType;
    },
    handleFunctionStateNotification(functionState) {
      this.functionSonificationData = functionState;
    },
    handleFunctionMessageEvent(functionMessageEvent) {
      console.log(
        `function message event: Tipo -> ${functionMessageEvent.type}, messaggio -> ${functionMessageEvent.message}`
      );
      this.liveMessage = functionMessageEvent.message;
    },
  },
};
</script>
<style scoped>
.function-summary {
}
</style>
