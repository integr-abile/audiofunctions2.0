<template></template>
<script>
import _ from "lodash";

export default {
  props: [
    "isEnabled",
    "instrument",
    "yFunctionValue",
    "xFunctionValue",
    "yPointerDistanceFromFunction",
    "domXRange",
    "domYRange",
  ],
  data() {
    return {
      domYIntervalExtremes: [],
      domYFrequencyMap: {},
      lastInstrument: null,
    };
  },
  mounted() {
    if (!this.checkPreconditions()) {
      return;
    }
    this.createDomYFrequencyMap();
  },
  watch: {
    isEnabled(val) {
      if (!val) {
        this.$soundFactory.stopSonification(this.instrument);
      }
    },
    yFunctionValue(val) {
      console.log("cambiato valore funzione");
      //   debugger;
      if (!this.checkPreconditions() || !this.isEnabled) {
        return;
      }
      console.log("inizio sonificazione");
      this.sonify();
    },
    yPointerDistanceFromFunction(val) {
      console.log("cambiata distanza tra il puntatore e la funzione");
      if (!this.checkPreconditions() || !this.isEnabled) {
        return;
      }
      this.sonify();
    },
    domXRange(val) {
      console.log("cambiato dom X");
      if (!this.checkPreconditions()) {
        return;
      }
      this.createDomYFrequencyMap();
    },
    domYRange(val) {
      console.log("cambiato dom Y");
      if (!this.checkPreconditions()) {
        return;
      }
      this.createDomYFrequencyMap();
    },
    instrument(val) {
      console.log("cambiato strumento");
      if (!this.checkPreconditions()) {
        return;
      }
      if (!_.isNil(this.lastInstrument)) {
        this.$soundFactory.stopSonification(this.lastInstrument);
      }
      this.lastInstrument = val;
      this.createDomYFrequencyMap();
    },
  },
  methods: {
    checkPreconditions() {
      return (
        !_.isNil(this.instrument) &&
        !_.isNil(this.domYRange) &&
        !_.isNil(this.domXRange)
      );
    },
    createDomYFrequencyMap() {
      const minDomainValue = this.domYRange[0];
      const maxDomainValue = this.domYRange[1];

      const structuredInstrument = this.$soundFactory.getInstrumentFrom(
        this.instrument
      );
      if (
        structuredInstrument.instrumentType ==
        this.$soundFactory.InstrumentFrequencyType.continuous
      ) {
        // debugger;
        const minFreq = structuredInstrument.frequencyRange.min;
        const maxFreq = structuredInstrument.frequencyRange.max;
        const sonificationSubdivisionsNumber =
          this.calculateSonificationSubdivisionsNumber(minFreq, maxFreq);
        const domYIntervalHeight =
          (maxDomainValue - minDomainValue) / sonificationSubdivisionsNumber;
        this.domYIntervalExtremes = [minDomainValue];
        let curValue = minDomainValue;
        while (curValue < maxDomainValue) {
          curValue += domYIntervalHeight;
          this.domYIntervalExtremes.push(curValue);
        }
        let frequencyIntervalExtremes = [];
        let curFreqValue = -1;
        for (var i = 0; i < this.domYIntervalExtremes.length; i++) {
          curFreqValue = curFreqValue == -1 ? minFreq : (curFreqValue *= 2);
          frequencyIntervalExtremes.push(curFreqValue);
        }
        this.domYFrequencyMap = {};
        this.domYIntervalExtremes.forEach((element, index) => {
          this.domYFrequencyMap[element] = frequencyIntervalExtremes[index];
        });
      } else {
        //per strumenti con sonificazione discreta
        const sonificationSubdivisionsNumber =
          structuredInstrument.availablePitchClasses.length;
        const domYIntervalHeight =
          (maxDomainValue - minDomainValue) / sonificationSubdivisionsNumber;
        this.domYIntervalExtremes = [minDomainValue];
        let curValue = minDomainValue;
        while (curValue < maxDomainValue) {
          curValue += domYIntervalHeight;
          this.domYIntervalExtremes.push(curValue);
        }
        this.domYFrequencyMap = {};
        this.domYIntervalExtremes.forEach((element, index) => {
          this.domYFrequencyMap[element] =
            structuredInstrument.availablePitchClasses[index];
        });
      }
    },
    calculateSonificationSubdivisionsNumber(maxFreq, minFreq) {
      let curValue = minFreq;
      let toReturn = 1;
      while (curValue < maxFreq) {
        curValue *= 2;
        toReturn += 1;
      }
      return toReturn;
    },
    sonify() {
      this.$soundFactory.sonify(
        this.yFunctionValue,
        this.xFunctionValue,
        this.yPointerDistanceFromFunction,
        this.domYIntervalExtremes,
        this.domYFrequencyMap,
        this.domXRange,
        this.domYRange,
        this.instrument
      );
    },
  },
};
</script>
