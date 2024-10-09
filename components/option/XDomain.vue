<template>
  <div>
    <h2>X axis interval</h2>
    <b-form>
      <div class="d-flex mb-2">
        <label for="min-x-domain-value" class="sr-only"
          >Minimum value showed on chart</label
        >
        <b-form-input
          id="min-x-domain-value"
          class="mr-1"
          type="number"
          style="width: 80px"
          v-model="xMin"
        >
        </b-form-input>
        <vue-mathjax :formula="formula" aria-hidden="true"></vue-mathjax>

        <label for="max-x-domain-value" class="sr-only"
          >Maximum value showed on chart</label
        >
        <b-form-input
          id="max-x-domain-value"
          type="number"
          style="width: 80px"
          v-model="xMax"
        >
        </b-form-input>
      </div>
      <div class="d-flex">
        <div class="mr-2">
          <label class="h-100 d-flex align-items-center" for="step"
            >Step</label
          >
        </div>
        <b-form-input
          id="step"
          type="number"
          step="0.1"
          min="0.1"
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
      formula: "$$\\le x \\le$$",
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
      console.log("aggiornati dai in x domain");
      this.currentOptionData = currenValues;
      this.xMin = `${currenValues.xMin}`;
      this.xMax = `${currenValues.xMax}`;
      this.step = `${currenValues.step}`;
    },
  },
};
</script>
