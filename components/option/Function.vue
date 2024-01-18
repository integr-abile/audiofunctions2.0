<template>
  <div>
    <!-- <VueAnnouncer /> -->
    <h2>Funzione</h2>
    <div v-if="!isTraitFunction" class="d-flex align-items-center">
      <vue-mathjax :formula="preFieldLabelText" class="mr-1"></vue-mathjax>
      <!-- Se sono su un elemento role application devo comunque attivarlo (premere enter) prima di iniziare a scrivere -->
      <h3 class="sr-only">
        Attiva la funzione (premi "Invio" su "applicazione")
      </h3>

      <math-field
        id="mathlive-mathfield"
        ref="mathfield"
        role="application"
        aria-label="attiva per inserire una funzione"
        class="border w-100"
      >
      </math-field>
    </div>
    <div v-else>
      <p>Modifica della funzione a tratti non ancora supportata</p>
    </div>

    <Keypress
      key-event="keyup"
      :multiple-keys="readMathKeys"
      @success="readMathExpression"
    />
  </div>
</template>

<script>
import Diff from "text-diff";
import _ from "lodash";

export default {
  emits: ["optionDataChange"],
  props: {
    optionData: Object,
  },
  data() {
    return {
      preFieldLabelText: "$$f(x) = $$",
      stableInputFunctionLatex: "",
      lastInsertedLatexFunction: "",
      currentToSpeakFunction: "",
      isTraitFunction: false,
      currentOptionData: {},
      readMathKeys: [
        {
          keyCode: 81, //Q
          modifiers: ["ctrlKey", "shiftKey"],
          preventDefault: true,
        },
      ],
    };
  },
  watch: {
    stableInputFunctionLatex(val) {
      // this.currentOptionData.fn = val;
      const { error, forFnPlotFormula } = this.validateFormula(val);
      // debugger;
      if (_.isNil(error)) {
        this.currentOptionData.fn = forFnPlotFormula;
        this.$refs.mathfield.value = val;
        this.$emit("optionDataChange", this.currentOptionData);
      } else {
        //TODO: gestire errore facendo apparire un messaggio sotto il campo di testo della formula
      }
    },
  },
  components: {
    Keypress: () => import("vue-keypress"),
  },
  mounted() {
    this.setupMathField();
    this.updateOptionData(this.optionData);
  },
  beforeDestroy() {
    this.cleanUp();
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
    readMathExpression(event, notRead = false) {
      if (_.isEmpty(this.currentToSpeakFunction)) {
        this.currentToSpeakFunction =
          this.$refs.mathfield.getValue("spoken-text");
      }
      if (_.isEmpty(this.lastInsertedLatexFunction)) {
        this.currentToSpeakFunction = "Nessuna formula presente";
      }

      this.$announcer.polite(this.currentToSpeakFunction);
      console.log(`mathexpr: ${this.currentToSpeakFunction}`);
    },
    cleanUp() {
      const mathField = this.$refs.mathfield;
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
      mathField.addEventListener("focus", this.focusInEvtFn);
    },
    focusOutEvtFn(evt) {
      //Quando col tab lascio il campo di input
      this.lastInsertedLatexFunction = evt.target.value;
      this.stableInputFunctionLatex = this.lastInsertedLatexFunction;
      console.log(`focus-out. Latex: ${evt.target.value}`);
      this.$announcer.assertive("");
    },
    focusInEvtFn(evt) {
      console.log("focused");
      // const formulaToRead = this.readMathExpression(evt, true);
      // this.$announcer.assertive(
      //   `Formula attuale: ${formulaToRead}. Campo di input della formula matematica. Scrivi una formula`
      // );
    },
    inputEvtFn(evt) {
      // console.log("inserito char math");
      // debugger;
      // const locale = evt.target.getOptions("locale");
      if (evt.inputType == "insertText") {
        this.lastInsertedLatexFunction = evt.target.value;
        const insertedChar = evt.data;
        console.log(insertedChar);
        this.$announcer.assertive(`${insertedChar}`);
      } else if (evt.inputType == "deleteContentBackward") {
        // console.log("cancellato");
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

      // this.stableInputFunctionLatex = evt.target.value;
      // console.log("Locale:", locale);
      const spokenFormula = evt.target.getValue("spoken-text");
      console.log(`direi ${spokenFormula}`);
      this.currentToSpeakFunction = spokenFormula;
      // evt.target.executeCommand("speak");
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
      this.stableInputFunctionLatex = this.lastInsertedLatexFunction;
      console.log(`focus-out. Latex: ${evt.target.value}`);
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
