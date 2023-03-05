<template>
  <div>
    <VueAnnouncer />
    <TextToSpeech
      :text-to-read="textToRead"
      lang="it-IT"
      @on-voices-loaded="onVoicesLoaded"
    />
    <header>
      <ChartActionsMenu />
    </header>
    <main>
      <ChartFunctionPlot />
    </main>
  </div>
</template>

<script>
export default {
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
