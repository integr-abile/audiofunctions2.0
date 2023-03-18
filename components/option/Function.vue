<template>
  <div>
    <mathlive-mathfield
      ref="mathfield"
      role="presentation"
      :options="{
        virtualKeyboardMode: 'manual',
        keypressSound: 'none',
      }"
      :value="inputFunctionLatex"
    >
    </mathlive-mathfield>
  </div>
</template>

<script>
import Diff from "text-diff";
import _ from "lodash";

export default {
  props: {
    optionData: Object,
  },
  data() {
    return {
      inputFunctionLatex: "",
      lastInsertedLatexFunction: "",
      currentOptionData: {},
    };
  },
  mounted() {
    this.updateOptionData(this.optionData);
    this.setupMathField();
  },
  methods: {
    updateOptionData(currentValues) {
      this.currentOptionData = currentValues;
      this.inputFunctionLatex = `${currentValues.fn}`;
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
        this.inputFunctionLatex = evt.target.value;
        console.log(`focus-out. Latex: ${evt.target.value}`);
      });

      mathField.addEventListener("input", (evt) => {
        // const locale = evt.target.getOptions("locale");
        if (evt.inputType == "insertText") {
          this.lastInsertedLatexFunction = evt.target.value;
          const insertedChar = evt.data;
          console.log(insertedChar);
          this.$announcer.assertive(`inserito ${insertedChar}`);
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

        // console.log("Locale:", locale);
        console.log(`direi ${evt.target.getValue("spoken-text")}`);

        // evt.target.executeCommand("speak");
      });

      mathField.addEventListener("focus-out", (evt) => {
        //Quando col tab lascio il campo di input
        this.inputFunctionLatex = evt.target.value;
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
