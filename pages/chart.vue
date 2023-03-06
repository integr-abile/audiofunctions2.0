<template>
  <div class="h-100 d-flex flex-column">
    <VueAnnouncer />
    <TextToSpeech
      :text-to-read="textToRead"
      lang="it-IT"
      @on-voices-loaded="onVoicesLoaded"
    />
    <header>
      <ChartActionsMenu />
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
  methods: {
    onVoicesLoaded(voices) {},
  },
};
</script>
