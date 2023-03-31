<template>
  <div>
    <h2>Dominio asse Y</h2>
    <b-form inline>
      <label for="min-x-domain-value" class="sr-only"
        >valore minimo di Y mostrato sul grafico</label
      >
      <b-form-input
        id="min-x-domain-value"
        class="mr-1"
        type="number"
        placeholder="0"
        style="width: 80px"
        v-model="yMin"
      >
      </b-form-input>
      <span class="mr-1 text-center">
        <vue-mathjax :formula="formula"></vue-mathjax>
      </span>

      <label for="max-x-domain-value" class="sr-only"
        >valore massimo di Y mostrato sul grafico</label
      >
      <b-form-input
        id="max-x-domain-value"
        v-model="yMax"
        type="number"
        placeholder="0"
        style="width: 80px"
      >
      </b-form-input>
    </b-form>
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
      formula: "$$<= y <=$$",
      currentOptionData: {},
      yMin: "",
      yMax: "",
      step: 0, //TODO: valutare perchè serve perchè secondo me non serve
    };
  },
  watch: {
    yMin(val) {
      this.currentOptionData.yMin = val;
      this.$emit("optionDataChange", this.currentOptionData);
    },
    yMax(val) {
      this.currentOptionData.yMax = val;
      this.$emit("optionDataChange", this.currentOptionData);
    },
  },
  created() {
    this.updateOptionData(this.optionData);
  },
  methods: {
    updateOptionData(currentValues) {
      this.currentOptionData = currentValues;
      this.yMin = `${currentValues.yMin}`;
      this.yMax = `${currentValues.yMax}`;
    },
  },
};
</script>
