<template>
  <div class="h-100 d-flex flex-column">
    <VueAnnouncer />
    <ChartSonifier
      v-bind="functionSonificationData"
      :isEnabled="functionSonificationOptions.isEnabled"
      :instrument="functionSonificationOptions.instrument"
      :domXRange="functionSonificationOptions.domXRange"
      :domYRange="functionSonificationOptions.domYRange"
      :earconObj="earconToNotifyObj"
    />
    <TextToSpeech
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
    <main
      class="h-100"
      aria-label="Grafico della funzione"
      tabindex="0"
      @focus="requestFnAsText"
    >
      <ChartFunctionPlot
        v-bind="functionOptions"
        :actionRequest="functionActionRequest"
        :isKeyboardInteractionEnabled="isFnInteractionEnabled"
        :fnAsText="fnTextRepresentation"
        id="fnPlot"
        ref="fnPlot"
        class="h-100"
        @needNotifyStatus="handleFunctionStateNotification"
        @needPlayEarcon="(earconObj) => (earconToNotifyObj = earconObj)"
        @needNotifyMessage="handleFunctionMessageEvent"
        @domainManuallyChanged="handleDomainManuallyChanged"
      />
    </main>
  </div>
</template>

<script>
import _ from "lodash";
var Queue = require("queue-fifo");

export default {
  layout: "fullscreen",
  data() {
    return {
      textToRead: "",
      chartActionMenuRefreshKey: 0,
      lastPendingMessageToRead: "",
      functionOptions: {},
      initialConfiguration: [],
      currentConfiguration: [],
      functionActionRequest: null, //oggetto del tipo {requestType: enum, repetition: 1}
      ttsOptions: null, //oggetto di configurazione che dice cosa può dire e quando il TTS
      isTTSEnabled: true, //questa variabile dev'essere mantenuta sincronizzata con quella nell'interaction bar come valore di default
      fnTextRepresentation: "",
      availableTTSVoices: [],
      isFnInteractionEnabled: true, //questa variabile dev'essere mantenuta sincronizzata con quella nell'interaction bar come valore di default
      lastFunctionActionRequestType: null,
      functionSonificationData: {},
      functionSonificationOptions: {},
      earconToNotifyObj: {},
      messageQueue: new Queue(),
      ttsMessageID: null,
      lastTimeAMessageIsInsertedIntoQueue: null,
      blockInsertIntoQueueTimeoutSeconds: 5,
      messageQueueMaxCapacity: 2, //non voglio tenere in coda messaggi troppo vecchi
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
      const config = sessionDataSerializer.parse(initialEncodedConfiguration);
      this.initialConfiguration = config;
    } catch (e) {
      this.initialConfiguration = this.defaultConfiguration;
      alert(e.message);
    }
  },
  destroyed() {
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
          identifier: "xDomain",
          data: {
            xMin: -16, //stessi di geogebra
            xMax: 16, //stessi di geogebra
            step: 1,
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
          identifier: "function",
          data: {
            fn: "sin(x)", //formato interval arithmetic
          },
          isFavorite: true,
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
                identifier: this.$TextToSpeechOption.maxMin,
                canPlayAutomatically: true,
              },

              {
                identifier: this.$TextToSpeechOption.axisIntersections,
                canPlayAutomatically: true,
              },
              {
                identifier: this.$TextToSpeechOption.coordinates,
                // canPlayAutomatically: false,
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
    requestFnAsText() {
      // debugger;
      this.fnTextRepresentation = document
        .getElementById("mathlive-mathfield")
        .getValue("spoken-text");
      console.log(
        "richiedo formula parlata " +
          document.getElementById("mathlive-mathfield").getValue("spoken-text")
      );
    },
    async handleEvent(evt) {
      if (!this.$soundFactory.isToneEngineStarted()) {
        this.$soundFactory.enableSonifier();
      }
    },
    onVoicesLoaded(voices) {
      console.log("Caricamento voci completato");
      this.availableTTSVoices = voices;
    },
    handleDomainManuallyChanged(changes) {
      // console.log("dominio cambiato " + changes);
      const newDomX = _.head(
        _.filter(changes, function (item) {
          return item.identifier == "xDomain";
        })
      );
      const newDomY = _.head(
        _.filter(changes, function (item) {
          return item.identifier == "yDomain";
        })
      );

      const newFunctionOptions = _.cloneDeep(this.functionOptions);
      newFunctionOptions.domXRange = [newDomX.data.xMin, newDomX.data.xMax];
      newFunctionOptions.domYRange = [newDomY.data.yMin, newDomY.data.yMax];
      this.functionOptions = newFunctionOptions;

      const newFunctionSonificationOptions = _.cloneDeep(
        this.functionSonificationOptions
      );
      newFunctionSonificationOptions.domXRange = this.functionOptions.domXRange;
      newFunctionSonificationOptions.domYRange = this.functionOptions.domYRange;
      this.functionSonificationOptions = newFunctionSonificationOptions;

      const idxOfXDomain = _.findIndex(this.currentConfiguration, {
        identifier: "xDomain",
      });
      const idxOfYDomain = _.findIndex(this.currentConfiguration, {
        identifier: "yDomain",
      });

      this.currentConfiguration[idxOfXDomain].data.xMax = newDomX.data.xMax;
      this.currentConfiguration[idxOfXDomain].data.xMin = newDomX.data.xMin;
      this.currentConfiguration[idxOfYDomain].data.yMax = newDomY.data.yMax;
      this.currentConfiguration[idxOfYDomain].data.yMin = newDomY.data.yMin;
    },
    onOptionsChangesSaved(optionsChanged) {
      //[{"identifier": "xDomain","data": {}]

      console.log(`options changed to: ${optionsChanged}`);
      //TODO: gestire salvataggio opzioni per TTS a questo livello
      this.valorizeFunctionParamsFromOptions(optionsChanged);
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
        fnAsText: _.isNil(functionData)
          ? this.functionOptions.fnAsText
          : functionData.data.fnAsText,
        sonificationStep: _.isNil(xDomainData)
          ? this.functionOptions.sonificationStep
          : parseInt(xDomainData.data.step),
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
    },
    handleFunctionMessageEvent(functionMessageEvent) {
      console.log(
        `function message event: Tipo -> ${functionMessageEvent.type}, messaggio -> ${functionMessageEvent.message}`
      );
      const permissionIndex = _.findIndex(this.ttsOptions.speechPermissions, {
        identifier: functionMessageEvent.type,
      });
      if (permissionIndex == -1) {
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
        console.log(
          "function message devo leggere AT " + functionMessageEvent.message
        );
        const now = new Date();
        if (_.isNil(this.lastTimeAMessageIsInsertedIntoQueue)) {
          this.lastTimeAMessageIsInsertedIntoQueue = now;
        }
        if (
          functionMessageEvent.message != this.lastPendingMessageToRead ||
          (now - this.lastTimeAMessageIsInsertedIntoQueue) / 1000 >
            this.blockInsertIntoQueueTimeoutSeconds
        ) {
          console.log("Messo in coda " + functionMessageEvent.message);
          this.messageQueue.enqueue(functionMessageEvent.message);
          this.lastPendingMessageToRead = functionMessageEvent.message;
          this.lastTimeAMessageIsInsertedIntoQueue = now;
        }

        // this.$announcer.assertive(functionMessageEvent.message);
        // if (this.isTTSEnabled) {
        //   this.textToRead = functionMessageEvent.message;
        // }
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
          this.$announcer.assertive(message);
          if (this.isTTSEnabled) {
            this.textToRead = message;
          }
        }.bind(this),
        process.env.TEXT_TO_SPEECH_MONITOR_QUEUE_INTERVAL_MS
      ); //TODO: rendere variabile d'ambiente
    },
  },
};
</script>
<style scoped>
.function-summary {
}
</style>
