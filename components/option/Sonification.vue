<template>
  <div>
    <h2>Sonificazione</h2>
    <b-form-select
      v-model="selectedInstrument"
      :options="optionData.availableInstruments"
    ></b-form-select>
  </div>
</template>
<script>
export default {
  emits: ["optionDataChange"],
  props: {
    optionData: Object,
  },
  data() {
    return {
      selectedInstrument: null,
      currentOptionData: {},
    };
  },
  watch: {
    selectedInstrument(val) {
      this.currentOptionData.selectedInstrument = val;
      this.$emit("optionDataChange", this.currentOptionData);
    },
  },
  created() {
    this.updateOptionData(this.optionData);
  },
  methods: {
    updateOptionData(currentValues) {
      this.currentOptionData = currentValues;
      this.selectedInstrument = currentValues.selectedInstrument;
    },
  },
};
</script>
