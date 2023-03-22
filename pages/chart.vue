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
      />
    </header>
    <main class="h-100">
      <ChartFunctionPlot v-bind="functionOptions" id="fnPlot" class="h-100" />
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
    };
  },
  created() {
    const sessionDataSerializer = this.$sessionDataSerializer;
    const initialEncodedConfiguration =
      this.$route.query[sessionDataSerializer.sessionDataQueryParamKey];
    if (initialEncodedConfiguration == null) {
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
  mounted() {
    this.valorizeFunctionParamsFromOptions(this.initialConfiguration);
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
            fn: "3x+2",
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
      ).data;

      this.functionOptions = {
        fn: functionData.fn,
      };
    },
  },
};
</script>
