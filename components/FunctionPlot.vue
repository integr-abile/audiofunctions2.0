<template>
  <div>
    <VueAnnouncer />
    <vue-web-speech-synth
      v-model="shouldRead"
      :text="textToRead"
      :voice="ttsVoice"
      @list-voices="listVoices"
    />
    <div v-if="isFunctionInteractionModeEnabled">
      <Keypress key-event="keyup" :key-code="13" @success="logKey" />
      <Keypress key-event="keyup" :key-code="65" @success="logKey" />
      <Keypress key-event="keyup" :key-code="83" @success="logKey" />

      <Keypress key-event="keydown" :key-code="39" @success="handleKeyDown" />
      <Keypress key-event="keyup" :key-code="39" @success="handleKeyUp" />
      <!-- TODO: Aggiungere shortcut per attivare disattivare modalità interazione con funzione -->
    </div>

    <header ref="header">
      <select v-model="synthVoice">
        <option
          v-for="(voice, index) in voiceList"
          :key="index"
          :value="voice.name"
        >
          {{ voice.name }} [{{ voice.lang }}]
          <!-- {{ voice }} -->
        </option>
      </select>
      <input
        type="checkbox"
        id="enableFnCheckbox"
        v-model="isFunctionInteractionModeEnabled"
      />
      <label for="enableFnCheckbox"
        >Interazione tramite tastiera
        {{
          isFunctionInteractionModeEnabled ? "abilitata" : "disabilitata"
        }}</label
      >
      <Keypress
        key-event="keyup"
        :multiple-keys="multiple"
        @success="readMathExpression"
      />
      <mathlive-mathfield
        ref="mathfield"
        id="mf"
        role="presentation"
        :options="{
          virtualKeyboardMode: 'manual',
          keypressSound: 'none',
        }"
      >
      </mathlive-mathfield>
      <p>{{ fun }}</p>
      <p>Formula: {{ inputFunctionLatex }}</p>
      <!-- <div id="formula-desmos" style="width: 600px; height: 400px"></div> -->
    </header>

    <div
      class="d-flex flex-column w-100 h-100"
      id="functionContainer"
      ref="fnContainer"
    >
      <div class="w-100 h-100" style="position: relative">
        <resize-observer @notify="handleResize" :emitOnMount="true" />

        <div role="application" tabindex="0" aria-label="area del grafico">
          <div id="root" aria-hidden="true"></div>
        </div>
      </div>
      <footer ref="footer" class="w-100" style="background-color: blue">
        <button @click="changeChartData">Change data</button>
        <b-button variant="danger">Prova bottone con bootstrap vue</b-button>
        <b-button v-b-toggle.sidebar-1>Toggle Sidebar</b-button>
        <b-sidebar id="sidebar-1" title="Sidebar" shadow>
          <div class="px-3 py-2">
            <p>
              Cras mattis consectetur purus sit amet fermentum. Cras justo odio,
              dapibus ac facilisis in, egestas eget quam. Morbi leo risus, porta
              ac consectetur ac, vestibulum at eros.
            </p>
            <b-img
              src="https://picsum.photos/500/500/?image=54"
              fluid
              thumbnail
            ></b-img>
          </div>
        </b-sidebar>
      </footer>
    </div>
  </div>
</template>

<script>
import functionPlot from "function-plot";
import * as Tone from "tone";
import _ from "lodash";
import Diff from "text-diff";
// import { ConvertFunction } from "../plugins/validate-function.mjs";

export default {
  data() {
    return {
      fun: "x",
      shouldRead: false,
      textToRead: "",
      voiceList: [],
      synthVoice: null,
      isFunctionInteractionModeEnabled: false,
      instrument: new Tone.Synth().toDestination(),
      keyLongPressed: false,
      keyTimer: null,
      currentFnXValue: 0,
      fnContainerWidth: 0,
      fnContainerHeight: 0,
      inputFunctionLatex: "",
      lastInsertedLatexFunction: "",
      lastA11ySpokenFormulaText: null,
      lastA11yCompleteSpokenFormulaText: null,
      multiple: [
        {
          keyCode: 81, //Q
          modifiers: ["ctrlKey", "shiftKey"],
          preventDefault: true,
        },
      ],
    };
  },
  watch: {
    fnContainerWidth: {
      handler(newVal) {
        this.updateFunctionChart();
      },
      immediate: true,
    },
    fnContainerHeight: {
      handler(newVal) {
        this.updateFunctionChart();
      },
      immediate: true,
    },
  },

  components: {
    Keypress: () => import("vue-keypress"),
    // Push,
  },
  computed: {
    ttsVoice() {
      return this.voiceList.find((elem) => elem.name == this.synthVoice);
    },
  },
  mounted() {
    console.log("mounted");
    // const desmosContainer = document.getElementById("formula-desmos");
    // var calculator = Desmos.GraphingCalculator(desmosContainer, {
    //   zoomButtons: false,
    //   graphpaper: false,
    //   expressionsTopbar: false,
    //   settingsMenu: false,
    //   language: "it",
    // });

    const mathField = document.getElementById("mf");
    mathField.addEventListener("change", (evt) => {
      //Return o enter premuto
      this.inputFunctionLatex = evt.target.value;
      console.log(`focus-out. Latex: ${evt.target.value}`);
    });
    mathField.addEventListener("move-out", function (evt) {
      console.log("moving out"); //quando sono ai bordi dell'espressione
    });

    mathField.addEventListener("selection-change", function (evt) {
      //quando cambio posizione al cursore
      //console.log(`caret position`);
      // evt.target.executeCommand("selectGroup");
      // evt.target.executeCommand("speak", "selection");
      //console.log(evt);
    });

    mathField.addEventListener("input", (evt) => {
      if (evt.inputType == "insertText") {
        this.lastInsertedLatexFunction = evt.target.value;
        const insertedChar = evt.data;
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
        this.lastInsertedLatexFunction = latexAfterDeletion;
        this.$announcer.assertive(`cancellato ${deletedText}`);
      }

      // var converted = ConvertFunction(evt.target.value);
      var converted = this.$validateFunction(evt.target.value);
      if (converted == null) {
        console.log("formula is not Valid...");
      } else {
        this.fun = converted;
        this.updateFunctionChart();
      }

      // console.log("Locale:", locale);
      //console.log(`direi ${evt.target.getValue("spoken-text")}`);
      //evt.target.executeCommand("speak");
    });

    mathField.addEventListener("focus-out", (evt) => {
      //Quando col tab lascio il campo di input
      // debugger;
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
      // this.$announcer.polite("Puoi continuare a scrivere");
    });
    // debugger;
    // this.$refs.mathfield.addEventListener("input", (ev) =>
    //   console.log("input")
    // );
  },

  methods: {
    changeChartData() {
      this.fun = "x^2";
      this.updateFunctionChart();
      this.instrument.triggerAttackRelease("C4", "4n");
    },
    resizeWindowAmt(amt) {
      window.resizeBy(amt, 0);
    },
    resizeWindow() {
      window.dispatchEvent(new Event("resize"));
    },
    logKeystroke(key, _ev) {
      console.log("keystroke");
      return true;
    },
    ping: () => {
      console.log("ping");
    },
    onNewFnInputValue(newVal) {
      console.log(`new fun val ${newVal}`);
    },
    listVoices(list) {
      this.voiceList = list;
    },
    logKey(event) {
      // debugger;

      console.log(event);
      this.textToRead = `premuto ${event.event.key}`;
      this.shouldRead = true;
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
    handleResize({ width, height }) {
      // setTimeout(() => {
      //   console.log(`Sul resize timeout ${$("#functionContainer").height()}`);
      // }, 100);
      // console.log(`resize ${width} ${height}`);

      this.fnContainerWidth = width;
      this.fnContainerHeight = height;

      // this.updateFunctionChart();
    },

    handleKeyDown(event) {
      console.log(`${event.event.key} DOWN`);
      if (this.keyTimer == null) {
        var repeat = function () {
          // debugger;
          this.currentFnXValue += 10;
          this.keyTimer = setTimeout(repeat, 200);
          console.log(`current fn x value: ${this.currentFnXValue}`);
        }.bind(this); //è necessario bindare il this alla funzione, altrimenti verrebbe perso il this dell'istanza di Vue all'interno della funzione: https://lusaxweb.github.io/vuesax-blog/tips/scope_this.html#create-var
        repeat();
      }
    },
    handleKeyUp(event) {
      console.log(`${event.event.key} UP`);
      if (this.keyTimer != null) {
        clearTimeout(this.keyTimer);
        this.keyTimer = null;
        this.currentFnXValue = 0;
      }
    },
    updateFunctionChart() {
      // debugger;

      const fnPlotInstance = functionPlot({
        target: "#root",
        width: this.fnContainerWidth,
        height: this.fnContainerHeight * 0.99,
        grid: true,
        data: [
          {
            fn: this.fun,
            derivative: {
              fn: "2 * x",
              updateOnMouseMove: true,
            },
          },
        ],
      });
      fnPlotInstance.on("mouseover", function () {
        console.log(`mouseover ${window.speechSynthesis}`);
        // setTimeout(() => {
        //   window.speechSynthesis.speak(
        //     new SpeechSynthesisUtterance("Hello world!")
        //   );
        // }, 100);
      });
    },
  },
};
</script>
