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
    />
    <TextToSpeech
      ref="tts"
      v-bind="ttsOptions"
      :isEnabled="isTTSEnabled"
      :text-to-read="textToRead"
      lang="it-IT"
      @onVoicesLoaded="onVoicesLoaded"
    />
    <header>
      <ChartActionsMenu
        ref="actionMenu"
        :customizableItems="initialConfiguration"
        :initialIsTTSEnabled="isTTSEnabled"
        @saveChanges="onOptionsChangesSaved"
        @switchPredefinedFunction="onSwitchPredefinedFunction"
        @userInteraction="handleFunctionActionRequest"
        @ttsEnableStatusChange="
          (isTextToSpeechEnabled) => (isTTSEnabled = isTextToSpeechEnabled)
        "
        @functionInteractionEnableStatusChange="
          (isFunctionInteractionEnabled) =>
            (isFnInteractionEnabled = isFunctionInteractionEnabled)
        "
        @customizableItemsConfigurationChange="
          (newConfig) => (currentConfiguration = newConfig)
        "
      />
    </header>
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
var Queue = require("queue-fifo");
import moment from "moment";
import appVersion from "~/assets/version.js";

export default {
  layout: "fullscreen",
  data() {
    return {
      textToRead: "",
      lastTimeTextToReadChanged: null,
      chartActionMenuRefreshKey: 0,
      lastPendingMessageToRead: "",
      functionOptions: {},
      initialConfiguration: [],
      currentConfiguration: [],
      functionActionRequest: null, //oggetto del tipo {requestType: enum, repetition: 1}
      ttsOptions: null, //oggetto di configurazione che dice cosa può dire e quando il TTS
      isTTSEnabled: false, //questa variabile dev'essere mantenuta sincronizzata con quella nell'interaction bar come valore di default
      fnTextRepresentation: "",
      availableTTSVoices: [],
      isFnInteractionEnabled: true, //questa variabile dev'essere mantenuta sincronizzata con quella nell'interaction bar come valore di default
      lastFunctionActionRequestType: null,
      functionSonificationData: {},
      functionSonificationOptions: {},
      isFnExplorationOutOfBounds: false,
      earconToNotifyObj: {},
      messageQueue: new Queue(),
      ttsMessageID: null,
      lastTimeAMessageIsInsertedIntoQueue: null,
      blockInsertIntoQueueTimeoutSeconds: 5,
      messageQueueMaxCapacity: 2, //non voglio tenere in coda messaggi troppo vecchi
      version: appVersion,
    };
  },
  created() {
    window.addEventListener("keydown", this.handleEvent);
    window.addEventListener("mousedown", this.handleEvent);
    //Deserializzazione URL per configurazione iniziale
    const sessionDataSerializer = this.$sessionDataSerializer;
    this.startMonitoringMessageQueue();
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
    availableTTSVoices(val) {
      if (_.isNil(this.ttsOptions)) {
        return;
      }
      const ttsData = _.head(
        _.filter(this.initialConfiguration, function (item) {
          return item.identifier == "tts";
        })
      );
      if (!_.isNil(ttsData)) {
        ttsData.data.availableVoices = val;
        this.initialConfiguration = _.cloneDeep(this.initialConfiguration); //x trigger aggiornamento data
      }
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
        {
          identifier: "tts",
          data: {
            speechPermissions: [
              {
                identifier: this.$TextToSpeechOption.coordinates,
              },
              {
                identifier: this.$TextToSpeechOption.intervals,
              },
              {
                identifier: this.$TextToSpeechOption.currentFunction,
              },
            ],
            availableVoices: [],
            selectedVoice: null,
          },
          isFavorite: false,
        },
      ];
    },
  },
  methods: {
    // requestFnAsText() {
    //   // debugger;
    //   this.fnTextRepresentation = document
    //     .getElementById("mathlive-mathfield")
    //     .getValue("spoken-text");
    //   console.log(
    //     "richiedo formula parlata " +
    //       document.getElementById("mathlive-mathfield").getValue("spoken-text")
    //   );
    // },
    async handleEvent(evt) {
      if (!this.$soundFactory.isToneEngineStarted()) {
        this.$soundFactory.enableSonifier();
      }
      // if (_.isEmpty(this.fnTextRepresentation)) {
      //   this.requestFnAsText();
      // }
      this.$refs.tts.getVoicesIfNeeded();
    },
    onVoicesLoaded(voices) {
      console.log("Caricamento voci completato");
      this.availableTTSVoices = voices;
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
      this.ttsOptions = {
        speechPermissions: _.isNil(ttsData)
          ? this.ttsOptions.speechPermissions
          : ttsData.data.speechPermissions,
        voice: _.isNil(ttsData)
          ? this.ttsOptions.voice
          : ttsData.data.selectedVoice,
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
      if (!this.functionSonificationData.shouldSound) {
        console.log("force stopping TTS");
        this.$refs.tts.stop();
      }
    },
    handleFunctionMessageEvent(functionMessageEvent) {
      console.log(
        `function message event: Tipo -> ${functionMessageEvent.type}, messaggio -> ${functionMessageEvent.message}`
      );
      const permissionIndex = _.findIndex(this.ttsOptions.speechPermissions, {
        identifier: functionMessageEvent.type,
      });
      if (permissionIndex == -1) {
        this.$announcer.polite(
          "Non hai il permesso di richiedere questa informazione"
        );
        return;
      }
      if (
        this.ttsOptions.speechPermissions[permissionIndex]
          .canPlayAutomatically ||
        !_.has(
          this.ttsOptions.speechPermissions[permissionIndex],
          "canPlayAutomatically"
        )
      ) {
        this.messageQueue.enqueue(functionMessageEvent.message);
      }
    },
    startMonitoringMessageQueue() {
      console.log("inizio monitoraggio coda messaggi TTS");
      this.ttsMessageID = setInterval(
        function () {
          // console.log("controllo coda messaggi...");
          if (this.messageQueue.isEmpty()) {
            // console.log("la coda è vuota");
            return;
          }
          const messageQueueCurrentSize = this.messageQueue.size();
          if (messageQueueCurrentSize > this.messageQueueMaxCapacity) {
            _.times(
              messageQueueCurrentSize - this.messageQueueMaxCapacity,
              () => {
                this.messageQueue.dequeue(); //tolgo gli elementi in eccesso dalla coda a partire dal più vecchio
              }
            );
          }
          const message = this.messageQueue.dequeue();
          console.log("TTS da passare a engine " + message);
          if (this.isTTSEnabled) {
            if (message !== this.textToRead) {
              this.lastTimeTextToReadChanged = Date.now();
            }
            const momentDateNow = moment(Date.now());
            const momentLastTimeTextToReadChanged = moment(
              this.lastTimeTextToReadChanged
            );
            if (
              !_.isNil(this.lastTimeTextToReadChanged) &&
              momentDateNow.diff(momentLastTimeTextToReadChanged, "seconds") >
                process.env.REPEAT_SAME_TEXT_TIME_THRESHOLD_SECONDS
            ) {
              console.log("TTS reset text to read");
              this.$refs.tts.speak(message);
            } else {
              this.textToRead = message;
            }
          } else {
            console.log(`speak through AT -> ${message}`);
            this.$announcer.assertive(message);
          }
        }.bind(this),
        process.env.TEXT_TO_SPEECH_MONITOR_QUEUE_INTERVAL_MS
      );
    },
  },
};
</script>
<style scoped>
.function-summary {
}
</style>
