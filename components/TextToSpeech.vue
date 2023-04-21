<template>
  <vue-web-speech-synth
    v-if="isEnabled"
    v-model="shouldRead"
    :text="textToRead"
    :voice="concreteVoice"
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
    voice: null,
    isEnabled: false,
    speechPermissions: null,
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
      if (this.shouldRead) {
        console.log(`devo leggere TTS ${newText}`);
      }
    },
    voicesAvailableForSelection(newVoices) {
      this.$emit("onVoicesLoaded", newVoices);
    },
  },
  computed: {
    concreteVoice() {
      if (_.isNil(this.voice)) {
        return null;
      }
      return this.voicesAvailableForSelection[
        this.availableVoicesDescription.indexOf(this.voice)
      ];
    },
    availableVoicesDescription() {
      ///Stesso algoritmo presente in OptionTTS in modo da ricostruire allo stesso modo le descrizioni degli oggetti TTS
      return _.map(this.voicesAvailableForSelection, function (voiceObj) {
        return `${voiceObj.name} [${voiceObj.lang}]`;
      });
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
