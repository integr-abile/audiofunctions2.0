<!-- <template>
  <vue-web-speech-synth
    v-if="isEnabled"
    v-model="shouldRead"
    :text="effectiveTextToRead"
    :voice="concreteVoice"
    :rate="1"
    @list-voices="listVoices"
  />
</template> -->
<template>
  <div></div>
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
      synth: window.speechSynthesis,
      voices: [],
      voicesAvailableForSelection: [],
      utteraceToRead: new window.SpeechSynthesisUtterance(),
    };
  },
  // mounted() {
  // debugger;
  // this.voices = this.synth.getVoices();
  // this.voicesAvailableForSelection = _.filter(this.voices, function (voice) {
  //   if (this.lang === null) {
  //     return true;
  //   }
  //   return voice.lang === this.lang;
  // });
  // },
  watch: {
    // lang(newLang, oldLang) {
    //   if (newLang != oldLang) {
    //     this.voicesAvailableForSelection = _.filter(collection, predicate);
    //   }
    // },
    textToRead(newText) {
      // if (newText == oldText) {
      //   this.effectiveTextToRead = "Ripeto: " + newText;
      // } else {
      //   this.effectiveTextToRead = newText;
      // }
      // this.shouldRead = true;

      // this.shouldRead = newText != oldText;

      console.log(`devo leggere TTS ${newText}`);
      this.speak(newText);
    },
    voicesAvailableForSelection(newVoices) {
      this.$emit("onVoicesLoaded", newVoices);
    },
  },
  computed: {
    concreteVoice() {
      if (_.isNil(this.voice)) {
        if (_.isEmpty(this.availableVoicesDescription)) {
          return null;
        } else {
          return _.head(this.voicesAvailableForSelection);
        }
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
    speak(text) {
      this.utteraceToRead.text = text;
      this.utteraceToRead.voice = this.concreteVoice;
      this.synth.speak(this.utteraceToRead);
    },
    getVoicesIfNeeded() {
      if (!_.isEmpty(this.voices)) {
        return;
      }
      this.fetchVoices();
    },
    fetchVoices() {
      this.voices = this.synth.getVoices();
      this.voicesAvailableForSelection = _.filter(
        this.voices,
        function (voice) {
          if (_.isNil(this.lang)) {
            return true;
          }
          return voice.lang === this.lang;
        }.bind(this)
      );
    },
    // listVoices(list) {
    //   this.voices = list;
    //   this.voicesAvailableForSelection = _.filter(
    //     this.voices,
    //     function (voice) {
    //       if (this.lang === null) {
    //         return true;
    //       }
    //       return voice.lang === this.lang;
    //     }.bind(this) //necessario bindare il this all'istanza vue, se no da dentro la cbk si perde il this
    //   );
    // },
  },
};
</script>
