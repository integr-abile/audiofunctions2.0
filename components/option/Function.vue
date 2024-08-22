<template>
  <div>
    <h2>Funzione</h2>
    <div class="d-flex flex-column">
      <h3>Inserimento&nbsp;<span class="sr-only">funzione</span></h3>
      <div class="d-flex align-items-center mb-4">
        <FormulaInput class="w-100" :functionLatex="stableInputFunctionLatex" @insertedFunction="handleInsertedFunctionUpdate"/>
      </div>

      <div class="d-flex align-items-center">
        <h3 class="mr-2">Funzione corrente</h3>
        <div class="d-flex align-items-center">
          <b-button
            variant="outline-secondary"
            size="sm"
            aria-label="Copia formula latex"
            title="Copia formula latex"
            v-clipboard:copy="stableInputFunctionLatex"
            v-clipboard:success="onCopy"
            v-clipboard:error="onCopyError"
            v-if="!isTraitFunction"
          >
            <b-icon-files></b-icon-files>
          </b-button>
          <b-alert
            v-model="showCopyAlert"
            :variant="lastCopyFunctionSuccess ? 'success' : 'danger'"
            dismissible
            aria-live="polite"
            aria-atomic="true"
          >
            {{
              this.lastCopyFunctionSuccess
                ? "Copiato"
                : "Errore durante la copia"
            }}
          </b-alert>
        </div>
      </div>

      <vue-mathjax
        :formula="mathJaxFunctionLatext"
        v-if="!isTraitFunction"
      ></vue-mathjax>
      <span v-else>Funzione a tratti</span>
    </div>
  </div>
</template>

<script>
import _ from "lodash";

export default {
  emits: ["optionDataChange"],
  props: {
    optionData: Object,
  },
  computed: {
    mathJaxFunctionLatext() {
      return "$$" + this.stableInputFunctionLatex + "$$";
    },
  },
  data() {
    return {
      stableInputFunctionLatex: "",
      lastInsertedLatexFunction: "",
      lastCopyFunctionSuccess: false,
      showCopyAlert: false,
      currentToSpeakFunction: "",
      isTraitFunction: false,
      currentOptionData: {},
      isFunctionValid: false,
    };
  },
  watch: {
    stableInputFunctionLatex(val) {
      const { error, forFnPlotFormula } = this.validateFormula(val);
      if (_.isNil(error)) {
        this.currentOptionData.fn = forFnPlotFormula;
        this.$emit("optionDataChange", this.currentOptionData);
      } else {
        console.error("Errore nella formula");
      }
    },
  },
  components: {
    Keypress: () => import("vue-keypress"),
  },
  mounted() {
    // this.setupMathField();
    this.updateOptionData(this.optionData);
  },
  methods: {
    updateOptionData(currentValues) {
      this.currentOptionData = currentValues;
      const fnObj = this.$functionParser.parse(currentValues.fn);
      if (this.$functionParser.isTraitFunction(fnObj)) {
        console.log("funzione a tratti");
        this.isTraitFunction = true;
      } else {
        this.isTraitFunction = false;
        const latexFormula = this.$functionValidator.toLatex(currentValues.fn); //fn dev'essere in formato interval-arithmetic
        this.stableInputFunctionLatex = latexFormula;
        this.lastInsertedLatexFunction = this.stableInputFunctionLatex;
      }
    },
    validateFormula(latexFormula) {
      return this.$functionValidator.validate(latexFormula);
    },
    handleInsertedFunctionUpdate(fnInsertedObj) {
      console.log("fnInsertedObj", fnInsertedObj);
      const {fnIntervalArith, fnLatex, isValid, confirmed} = fnInsertedObj;
      this.lastInsertedLatexFunction = fnLatex;
      this.stableInputFunctionLatex = fnLatex;
    },
    onCopy(evt) {
      this.lastCopyFunctionSuccess = true;
      this.showCopyAlert = true;
      console.log("copia ok " + evt.text);
    },
    onCopyError(evt) {
      this.lastCopyFunctionSuccess = false;
      this.showCopyAlert = true;
      console.error("errore copia");
    },
  },
};
</script>
<style scoped lang="scss">
math-field {
  &:focus-within {
    outline: 2px solid black;
  }
}
</style>
