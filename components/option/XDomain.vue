<template>
  <div>
    <h2>Intervallo asse X</h2>
    <b-form>
      <div class="d-flex mb-2">
        <label for="min-x-domain-value" class="sr-only"
          >valore minimo di X mostrato sul grafico</label
        >
        <b-form-input
          id="min-x-domain-value"
          class="mr-1"
          type="number"
          placeholder="0"
          style="width: 80px"
          v-model="xMin"
        >
        </b-form-input>
        <vue-mathjax :formula="formula"></vue-mathjax>

        <label for="min-x-domain-value" class="sr-only"
          >valore massimo di X mostrato sul grafico</label
        >
        <b-form-input
          id="min-x-domain-value"
          type="number"
          placeholder="0"
          style="width: 80px"
          v-model="xMax"
        >
        </b-form-input>
      </div>
      <div class="d-flex">
        <div class="mr-2">
          <label class="h-100 d-flex align-items-center" for="step"
            >Passo</label
          >
        </div>
        <b-form-input
          id="step"
          type="number"
          placeholder="0"
          style="width: 80px"
          v-model="step"
        ></b-form-input>
      </div>
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
      formula: "$$<= x <=$$",
      currentOptionData: {},
      xMin: "",
      xMax: "",
      step: "",
    };
  },
  watch: {
    xMin(val) {
      this.currentOptionData.xMin = val;
      this.$emit("optionDataChange", this.currentOptionData);
    },
    xMax(val) {
      this.currentOptionData.xMax = val;
      this.$emit("optionDataChange", this.currentOptionData);
    },
    step(val) {
      this.currentOptionData.step = val;
      this.$emit("optionDataChange", this.currentOptionData);
    },
    optionData(val) {
      this.updateOptionData(val);
    },
  },
  created() {
    this.updateOptionData(this.optionData);
  },
  methods: {
    updateOptionData(currenValues) {
      this.currentOptionData = currenValues;
      this.xMin = `${currenValues.xMin}`;
      this.xMax = `${currenValues.xMax}`;
      this.step = `${currenValues.step}`;
    },
  },
};
</script>
