<template>
  <vue-web-speech-synth
    v-if="isEnabled"
    v-model="shouldRead"
    :text="textToRead"
    :voice="ttsVoice"
    @list-voices="listVoices"
  />
</template>

<script>
import _ from "lodash";

export default {
  emits: ["onVoicesLoaded"],
  props: {
    lang: String,
    textToRead: String,
    ttsVoice: null,
    isEnabled: false,
  },
  data() {
    return {
      shouldRead: false,
      voices: [],
      voicesAvailableForSelection: [],
    };
  },
  watch: {
    lang(newLang, oldLang) {
      if (newLang != oldLang) {
        this.voicesAvailableForSelection = _.filter(collection, predicate);
      }
    },
    textToRead(newText, oldText) {
      this.shouldRead = newText != oldText;
    },
    voicesAvailableForSelection(newVoices) {
      this.$emit("onVoicesLoaded", newVoices);
    },
  },

  methods: {
    listVoices(list) {
      this.voices = list;
      this.voicesAvailableForSelection = _.filter(
        this.voices,
        function (voice) {
          if (this.lang === null) {
            return true;
          }
          return voice.lang === this.lang;
        }.bind(this) //necessario bindare il this all'istanza vue, se no da dentro la cbk si perde il this
      );
    },
  },
};
</script>
