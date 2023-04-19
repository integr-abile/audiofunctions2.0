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
      :isEnabled="isTTSEnabled"
      :text-to-read="textToRead"
      lang="it-IT"
      @on-voices-loaded="onVoicesLoaded"
    />
    <header>
      <ChartActionsMenu
        :customizableItems="initialConfiguration"
        :initialIsTTSEnabled="isTTSEnabled"
        @saveChanges="onOptionsChangesSaved"
        @userInteraction="handleFunctionActionRequest"
        @ttsEnableStatusChange="
          (isTextToSpeechEnabled) => (isTTSEnabled = isTextToSpeechEnabled)
        "
      />
    </header>
    <main class="h-100">
      <ChartFunctionPlot
        v-bind="functionOptions"
        :actionRequest="functionActionRequest"
        :ttsOptions="ttsOptions"
        id="fnPlot"
        class="h-100"
        @needNotifyStatus="handleFunctionStateNotification"
        @needPlayEarcon="(earconObj) => (earconToNotifyObj = earconObj)"
        @needNotifyMessage="handleFunctionMessageEvent"
      />
    </main>
  </div>
</template>

<script>
import _ from "lodash";
import * as Tone from "tone";

export default {
  layout: "fullscreen",
  data() {
    return {
      textToRead: "",
      functionOptions: {},
      initialConfiguration: [],
      functionActionRequest: null, //oggetto del tipo {requestType: enum, repetition: 1}
      ttsOptions: null, //oggetto di configurazione che dice cosa può dire e quando il TTS
      isTTSEnabled: true,
      lastFunctionActionRequestType: null,
      functionSonificationData: {},
      functionSonificationOptions: {},
      earconToNotifyObj: {},
    };
  },
  created() {
    //Deserializzazione URL per configurazione iniziale
    const sessionDataSerializer = this.$sessionDataSerializer;

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
  async mounted() {
    this.isSonificationEnabled = await this.$soundFactory.enableSonifier();
  },
  watch: {
    initialConfiguration(val) {
      this.valorizeFunctionParamsFromOptions(val);
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
            fn: "sin(x)",
          },
          isFavorite: true,
        },
        {
          identifier: "sonification",
          data: {
            availableInstruments: this.$soundFactory.getAllInstrumentsName(),
            selectedInstrument: null,
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
            ],
          },
          isFavorite: false,
        },
      ];
    },
  },
  methods: {
    onVoicesLoaded(voices) {},
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
        this.ttsOptions.speechPermissions[permissionIndex].canPlayAutomatically
      ) {
        console.log(
          "function message devo leggere AT " + functionMessageEvent.message
        );
        this.$announcer.assertive(functionMessageEvent.message);
        if (this.isTTSEnabled) {
          this.textToRead = functionMessageEvent.message;
        }
      }
    },
  },
};
</script>
<style scoped>
.function-summary {
}
</style>
