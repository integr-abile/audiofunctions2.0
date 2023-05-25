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
      lastReadUtterance: null,
      isThereNotReadText: false,
      utteranceToRead: new SpeechSynthesisUtterance(),
      isSpeaking: false,
    };
  },

  watch: {
    textToRead(newText) {
      console.log("TTS nuovo testo arrivato " + newText);
      // if (newText === this.lastReadUtterance) {
      //   return;
      // }
      if (!this.isSpeaking) {
        console.log(`devo leggere TTS ${newText}`);
        this.speak(newText);
        this.lastReadUtterance = newText;
      } else {
        this.isThereNotReadText = true;
        console.log("TTS ma non posso leggerlo");
      }
    },
    isSpeaking(newVal) {
      if (!newVal && this.isThereNotReadText) {
        this.isThereNotReadText = false;
        console.log("TTS quindi ora recupero");
        this.speak(this.textToRead);
        this.lastReadUtterance = this.textToRead;
      }
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
    stop() {
      this.synth.cancel();
      this.isSpeaking = false;
    },
    speak(text) {
      this.utteranceToRead.text = text;
      this.utteranceToRead.voice = this.concreteVoice;
      this.utteranceToRead.rate = 2;

      this.utteranceToRead.onend = function () {
        this.isSpeaking = false;
      }.bind(this);
      console.log("sto per dire " + text);
      this.isSpeaking = true;
      this.synth.speak(this.utteranceToRead);
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
          return true;
          // return voice.lang === this.lang;
        }.bind(this)
      );
    },
  },
};
</script>
