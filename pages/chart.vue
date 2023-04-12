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
      :text-to-read="textToRead"
      lang="it-IT"
      @on-voices-loaded="onVoicesLoaded"
    />
    <header>
      <ChartActionsMenu
        :customizableItems="initialConfiguration"
        @saveChanges="onOptionsChangesSaved"
        @userInteraction="handleFunctionActionRequest"
      />
    </header>
    <main class="h-100">
      <ChartFunctionPlot
        v-bind="functionOptions"
        :actionRequest="functionActionRequest"
        id="fnPlot"
        class="h-100"
        @needNotifyStatus="handleFunctionStateNotification"
        @needPlayEarcon="(earconObj) => (earconToNotifyObj = earconObj)"
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
            xMin: 1,
            xMax: 3,
            step: 1,
          },
          isFavorite: false,
        },
        {
          identifier: "yDomain",
          data: {
            yMin: 2,
            yMax: 3,
            step: 1,
          },
          isFavorite: false,
        },
        {
          identifier: "function",
          data: {
            fn: "x",
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
      ];
    },
  },
  methods: {
    onVoicesLoaded(voices) {},
    onOptionsChangesSaved(optionsChanged) {
      //[{"identifier": "xDomain","data": {}]
      console.log(`options changed to: ${optionsChanged}`);

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
  },
};
</script>
<style scoped>
.function-summary {
}
</style>
