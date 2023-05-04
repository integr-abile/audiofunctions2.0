<template>
  <div>
    <h2>Sonificazione</h2>
    <div class="d-flex mb-2">
      <div class="mr-2">
        <label
          class="h-100 d-flex align-items-center"
          for="sonification-instrument-type"
          >Strumento</label
        >
      </div>
      <b-form-select
        id="sonification-instrument-type"
        v-model="selectedInstrument"
        :options="optionData.availableInstruments"
      ></b-form-select>
    </div>
    <div class="d-flex">
      <b-form-checkbox
        id="sonification-abilitation-check"
        v-model="status"
        value="abilitata"
        unchecked-value="disabilitata"
      >
      </b-form-checkbox>
      <div class="ml-2">
        <label aria-hidden="true" class="h-100 d-flex align-items-center"
          >Stato: {{ status }}</label
        >
        <label for="sonification-abilitation-check" class="sr-only">
          Stato sonificazione: {{ status }}
        </label>
      </div>
    </div>
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
      status: "",
      currentOptionData: {},
    };
  },
  computed: {
    sonificationAbilitationState() {
      return this.isEnabled ? "Abilitata" : "Disabilitata";
    },
  },
  watch: {
    selectedInstrument(val) {
      this.currentOptionData.selectedInstrument = val;
      this.$emit("optionDataChange", this.currentOptionData);
    },
    status(val) {
      this.currentOptionData.isEnabled = val == "abilitata" ? true : false;
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
      this.status = currentValues.isEnabled ? "abilitata" : "disabilitata";
    },
  },
};
</script>
