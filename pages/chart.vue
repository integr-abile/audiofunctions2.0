<template>
  <div class="h-100 d-flex flex-column">
    <VueAnnouncer />
    <TextToSpeech
      :text-to-read="textToRead"
      lang="it-IT"
      @on-voices-loaded="onVoicesLoaded"
    />
    <header>
      <ChartActionsMenu :customizableItems="customizableItems" />
    </header>
    <main class="h-100">
      <ChartFunctionPlot id="fnPlot" class="h-100" fn="x" />
    </main>
  </div>
</template>

<script>
export default {
  layout: "fullscreen",
  data() {
    return {
      textToRead: "",
    };
  },
  computed: {
    customizableItems() {
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
      ];
    },
  },
  methods: {
    onVoicesLoaded(voices) {},
  },
};
</script>
