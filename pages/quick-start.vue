<template>
  <div class="d-flex flex-column align-items-center">
    <h2 class="mt-2">Puoi iniziare provando una delle seguenti</h2>
    <ul class="mb-3 d-flex flex-column" style="padding-inline-start: unset">
      <li
        v-for="(fn, index) in mathjaxFunctionsLatex"
        :key="fn"
        class="my-3 d-flex flex-column align-items-center"
        style="list-style-type: none"
      >
        <b-button
          size="md"
          class="w-100"
          @click="handlePredefinedFunctionSelection(index)"
        >
          <vue-mathjax :formula="fn"></vue-mathjax>
        </b-button>
      </li>
    </ul>
    <h2>Oppure puoi scriverne una tu</h2>
    <FormulaInput @insertedFunction="handleInsertedFunctionUpdate" />
    <NuxtLink class="btn btn-info my-3" to="/configure"
      >Configura la funzione nel dettaglio</NuxtLink
    >

    <p>
      ara descubrir todas las características de Audiofunctions o para cualquier  problema siempre puedes consultar las
      <NuxtLink to="/instructions">instrucciones</NuxtLink>
    </p>

    <b-button :disabled="!canStartExploringFunction" size="lg" variant="success" class="my-3" @click="goToChart"
      >Explora la función</b-button
    >
  </div>
</template>
<script>
import _ from "lodash";

export default {
  layout: "innerPage",
  mounted() {
    this.$store.commit("setTitle", "Crea la tua prima funzione");
  },
  data(){
    return{
      currentInstertedFunctionIntervalArith: null
    }
  },
  computed:{
    predefinedFunctions(){
      return this.$store.state.functions.predefinedFunctions;
    },
    canStartExploringFunction(){
      return this.currentInstertedFunctionIntervalArith
    },
    predefinedSelectableFunctions(){
      return this.predefinedFunctions
      .filter((fn) => {
        const fnObj = this.$functionParser.parse(fn);
        return !this.$functionParser.isTraitFunction(fnObj);
      });
    },
    mathjaxFunctionsLatex(){
      return this.predefinedSelectableFunctions
      .map((fn) => {
        const latexFormula = this.$functionValidator.toLatex(fn)
        return "$$" + latexFormula + "$$";
      });
    }
  },
  methods:{
    handlePredefinedFunctionSelection(index){
      const functionIntervalArithSelected = this.predefinedSelectableFunctions[index];
      const fnObj = [{
        identifier: "function",
        params:[
          {
            id: "fn",
            value: functionIntervalArithSelected
          }
        ]
      }];
      const sessionDataSerializer = this.$sessionDataSerializer;
      const encodedOverrideParams = sessionDataSerializer.encode(fnObj);
      this.$router.push("/chart?sd=" + encodedOverrideParams);
    },
    goToChart(){
      const fnObj = [{
        identifier: "function",
        params:[
          {
            id: "fn",
            value: this.currentInstertedFunctionIntervalArith
          }
        ]
      }];
      const sessionDataSerializer = this.$sessionDataSerializer;
      const encodedOverrideParams = sessionDataSerializer.encode(fnObj);
      this.$router.push("/chart?sd=" + encodedOverrideParams);
    },
    handleInsertedFunctionUpdate(fnInsertedObj){
      console.log("fnInsertedObj", fnInsertedObj);
      this.currentInstertedFunctionIntervalArith = fnInsertedObj.fnIntervalArith;
    }
  }
};
</script>
