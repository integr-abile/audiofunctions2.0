<template>
  <div>
    <VueAnnouncer />
    <TextToSpeech
      :text-to-read="textToRead"
      lang="it-IT"
      @on-voices-loaded="onVoicesLoaded"
    />
  </div>
</template>

<script>
export default {
  data() {
    return {
      textToRead: "ciao",
    };
  },
  methods: {
    onVoicesLoaded(voices) {},
  },
};
</script>
