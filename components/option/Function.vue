<template>
  <div>
    <VueAnnouncer />
    <h2>Funzione</h2>
    <div class="d-flex align-items-center">
      <vue-mathjax :formula="preFieldLabelText" class="mr-1"></vue-mathjax>
      <mathlive-mathfield
        ref="mathfield"
        role="presentation"
        :options="{
          virtualKeyboardMode: 'manual',
          virtualKeyboards: 'numeric',
          keypressSound: 'none',
          smartFence: false,
          mode: 'math',
        }"
        :value="stableInputFunctionLatex"
        class="border w-100"
      >
      </mathlive-mathfield>
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
      currentOptionData: {},
      readMathKeys: [
        {
          keyCode: 81, //Q
          modifiers: ["ctrlKey, shiftKey"],
          preventDefault: true,
        },
      ],
    };
  },
  watch: {
    stableInputFunctionLatex(val) {
      this.currentOptionData.fn = val;
      this.validateFormula(val);
      this.$emit("optionDataChange", this.currentOptionData);
    },
  },
  components: {
    Keypress: () => import("vue-keypress"),
  },
  mounted() {
    this.updateOptionData(this.optionData);
    this.setupMathField();
  },
  methods: {
    updateOptionData(currentValues) {
      this.currentOptionData = currentValues;
      this.stableInputFunctionLatex = `${currentValues.fn}`;
      this.lastInsertedLatexFunction = this.stableInputFunctionLatex;
    },
    validateFormula(latexFormula) {
      this.$functionValidator.validate(latexFormula);
    },
    readMathExpression(event, notRead = false) {
      // debugger;
      const formula = this.$refs.mathfield.getValue("spoken-text");
      const repeatPrefix = "Ripeto: ";
      var toRead = formula;
      if (_.isEmpty(toRead)) {
        toRead = "Nessuna formula presente";
      }

      if (notRead) {
        return toRead;
      }

      if (formula === this.lastA11ySpokenFormulaText) {
        toRead = `${
          this.lastA11yCompleteSpokenFormulaText.startsWith(repeatPrefix)
            ? ""
            : repeatPrefix
        }${toRead}`;
      }
      this.lastA11yCompleteSpokenFormulaText = toRead;
      this.lastA11ySpokenFormulaText = formula;
      this.$announcer.assertive(`${toRead}`);
      // this.$announcer.polite("");
      console.log(`mathexpr: ${toRead}`);
    },
    setupMathField() {
      const mathField = this.$refs.mathfield.$el;
      mathField.addEventListener("change", (evt) => {
        //Return o enter premuto
        this.lastInsertedLatexFunction = evt.target.value;
        this.stableInputFunctionLatex = this.lastInsertedLatexFunction;
        console.log(`focus-out. Latex: ${evt.target.value}`);
      });
      mathField.addEventListener("beforeinput", (evt) => {
        if (evt.target.value === "" && evt.inputType != "insertText") {
          console.log(
            "il campo è già vuoto. Ignoro cancellazione per evento " +
              evt.inputType
          );
          evt.preventDefault(); //necessario questo listener per via di un bug di mathfield nel quale se cerco di cancellare e il campo è già vuoto, il componente crasha
        }
      });
      //Math shortcut: https://cortexjs.io/mathlive/reference/keybindings/
      mathField.addEventListener("input", (evt) => {
        // console.log("inserito char math");
        // debugger;
        // const locale = evt.target.getOptions("locale");
        if (evt.inputType == "insertText") {
          this.lastInsertedLatexFunction = evt.target.value;
          const insertedChar = evt.data;
          console.log(insertedChar);
          this.$announcer.assertive(`inserito ${insertedChar}`);
        } else if (evt.inputType == "deleteContentBackward") {
          console.log("cancellato");
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
        console.log(`direi ${evt.target.getValue("spoken-text")}`);

        // evt.target.executeCommand("speak");
      });

      mathField.addEventListener("focus-out", (evt) => {
        //Quando col tab lascio il campo di input
        this.lastInsertedLatexFunction = evt.target.value;
        this.stableInputFunctionLatex = this.lastInsertedLatexFunction;
        console.log(`focus-out. Latex: ${evt.target.value}`);
        this.$announcer.assertive("");
      });
      mathField.addEventListener("focus", (evt) => {
        console.log("focused");
        const formulaToRead = this.readMathExpression(evt, true);
        this.$announcer.assertive(
          `Formula attuale: ${formulaToRead}. Campo di input della formula matematica. Scrivi una formula`
        );
      });
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
