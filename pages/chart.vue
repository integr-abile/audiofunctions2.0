<template>
  <div class="h-100 d-flex flex-column">
    <VueAnnouncer />
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
      />
    </main>
  </div>
</template>

<script>
import _ from "lodash";

export default {
  layout: "fullscreen",
  data() {
    return {
      textToRead: "",
      functionOptions: {},
      initialConfiguration: [],
      functionActionRequest: null, //oggetto del tipo {requestType: enum, repetition: 1}
      lastFunctionActionRequestType: null,
    };
  },
  created() {
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
            yMin: 1,
            yMax: 3,
            step: 1,
          },
          isFavorite: false,
        },
        {
          identifier: "function",
          data: {
            fn: null,
          },
          isFavorite: true,
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

      this.functionOptions = {
        fn: _.isNil(functionData)
          ? this.functionOptions.fn
          : functionData.data.fn,
        sonificationStep: _.isNil(xDomainData)
          ? this.functionOptions.sonificationStep
          : xDomainData.data.step,
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
  },
};
</script>
