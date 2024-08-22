<template>
  <div class="w-50">
    <div class="d-flex">
      <vue-mathjax :formula="preFieldLabelText" class="mr-1"></vue-mathjax>
      <math-field
        ref="mathfield"
        role="application"
        aria-label="attiva per inserire una funzione"
        class="border w-100"
      >
      </math-field>
    </div>
    <p v-if="lastInsertedLatexFunction" :style="{ color: formulaStatusColor }">
      {{ isFormulaValid ? "Formula valida" : "Formula non valida" }}
    </p>
    <vue-mathjax class="sr-only" :formula="mathJaxFunctionLatex"></vue-mathjax>
  </div>
</template>

<script>
import Diff from "text-diff";
import _ from "lodash";

export default {
  emits: ["insertedFunction"],
  data() {
    return {
      preFieldLabelText: "$$f(x) = $$",
      lastInsertedLatexFunction: null,
      isFormulaValid: false,
      formulaStatusColor: "",
    };
  },
  computed: {
    mathJaxFunctionLatex() {
      return "$$" + this.lastInsertedLatexFunction + "$$";
    },
  },
  watch: {
    lastInsertedLatexFunction(newVal) {
      const formulaValidationResult = this.validateFormula(newVal);
      this.isFormulaValid = _.isNil(formulaValidationResult.error);
      this.$emit("insertedFunction",{
        fnIntervalArith: formulaValidationResult.forFnPlotFormula,
        fnLatex: newVal,
        isValid: this.isFormulaValid
      })
    },
    isFormulaValid(newVal) {
      this.formulaStatusColor = newVal ? "green" : "red";
    },
  },
  mounted() {
    this.setupMathField();
  },
  beforeDestroy() {
    this.cleanUp();
  },
  methods: {
    validateFormula(latexFormula) {
      return this.$functionValidator.validate(latexFormula);
    },
    cleanUp() {
      const mathField = this.$refs.mathfield;
      if (_.isNil(mathField)) return;
      mathField.removeEventListener("change", this.changeEvtFn);
      mathField.removeEventListener("beforeinput", this.beforeInputEvtFn);
      //Math shortcut: https://cortexjs.io/mathlive/reference/keybindings/
      mathField.removeEventListener("keydown", this.keydownEvtFn, {
        capture: true,
      });
      mathField.removeEventListener("input", this.inputEvtFn);

      mathField.removeEventListener("focus-out", this.focusOutEvtFn);
      mathField.removeEventListener("focus", this.focusInEvtFn);
    },
    setupMathField() {
      const mathField = this.$refs.mathfield;
      mathField.mathVirtualKeyboardPolicy = "manual";
      mathVirtualKeyboard.layouts = ["numeric", "symbols"];
      mathVirtualKeyboard.keypressSound = "none";
      mathVirtualKeyboard.plonkSound = "none";
      mathField.smartFence = false;
      mathField.smartMode = false;
      mathField.defaultMode = "math";
      mathField.inlineShortcuts = {
        ...mathField.inlineShortcuts,
        abs: "\|{#?}\|",
      };

      mathField.addEventListener("change", this.changeEvtFn);
      mathField.addEventListener("beforeinput", this.beforeInputEvtFn);
      //Math shortcut: https://cortexjs.io/mathlive/reference/keybindings/
      mathField.addEventListener("keydown", this.keydownEvtFn, {
        capture: true,
      });
      mathField.addEventListener("input", this.inputEvtFn);
      mathField.addEventListener("focus-out", this.focusOutEvtFn);
    },
    focusOutEvtFn(evt) {
      //Quando col tab lascio il campo di input
      this.lastInsertedLatexFunction = evt.target.value;
      console.log(`focus-out. Latex: ${evt.target.value}`);
      this.$announcer.assertive("");
    },
    inputEvtFn(evt) {
      if (evt.inputType == "insertText") {
        this.lastInsertedLatexFunction = evt.target.value;
        const insertedChar = evt.data;
        console.log(insertedChar);
        this.$announcer.assertive(`${insertedChar}`);
      } else if (evt.inputType == "deleteContentBackward") {
        const latexAfterDeletion = evt.target.value;

        const diff = new Diff();
        const textDiff = diff.main(
          this.lastInsertedLatexFunction,
          latexAfterDeletion
        );
        const deletedText = textDiff.reduce(
          (acc, [key, value]) => ({ ...acc, [key]: value }),
          {}
        )["-1"];
        console.log(`cancellato ${deletedText}`);
        this.lastInsertedLatexFunction = latexAfterDeletion;
        this.$announcer.assertive(`cancellato ${deletedText}`);
      }
    },
    keydownEvtFn(evt) {
      if (evt.key === "\\" || evt.key === "Escape" || evt.key === "|") {
        evt.preventDefault();
      }
    },
    beforeInputEvtFn(evt) {
      if (evt.target.value === "" && evt.inputType != "insertText") {
        console.log(
          "il campo è già vuoto. Ignoro cancellazione per evento " +
            evt.inputType
        );
        evt.preventDefault(); //necessario questo listener per via di un bug di mathfield nel quale se cerco di cancellare e il campo è già vuoto, il componente crasha
      }
    },
    changeEvtFn(evt) {
      //Return o enter premuto
      this.lastInsertedLatexFunction = evt.target.value;
    },
  },
};
</script>
