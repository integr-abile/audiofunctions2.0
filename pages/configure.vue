<template>
  <div id="config-container">
    <div class="option-container p-5 m-3">
      <h2>Inserimento funzione del grafico</h2>
      <FormulaInput @insertedFunction="handleInsertedFunctionUpdate" />
    </div>
    <div class="d-flex justify-content-start">
      <div class="option-container p-5 m-3 flex-grow-1">
        <OptionXDomain :optionData="xDomainData" />
      </div>
      <div class="option-container p-5 m-3 flex-grow-1">
        <OptionYDomain :optionData="yDomainData" />
      </div>
    </div>
    <div class="option-container p-5 m-3">
      <h2>Didattica</h2>
    </div>
    <div class="d-flex justify-content-end">
      <b-button variant="primary" size="lg" class="mr-2" @click="showChartLink"
        >Genera link</b-button
      >
      <b-button variant="success" size="lg" class="mr-3" @click="goToChart"
        >Esplora</b-button
      >
    </div>
    <div v-if="generatedLink" class="text-right mr-3 mt-1">
      <p id="link-container" class="mr-2">
        <NuxtLink :to="generatedLink">Link al grafico</NuxtLink>
      </p>
      <div class="d-flex justify-content-end align-items-center">
        <b-alert
          v-model="showCopyAlert"
          :variant="lastLinkCopySuccess ? 'success' : 'danger'"
          dismissible
          aria-live="polite"
          aria-atomic="true"
        >
          {{ this.lastLinkCopySuccess ? "Link Copiato" : "Errore durante la copia del link" }}
        </b-alert>
        <b-button
          variant="outline-secondary"
          aria-label="copia link al grafico"
          size="sm"
          title="copia link al grafico"
          v-clipboard:copy="generatedLink"
          v-clipboard:success="onLinkCopy"
          v-clipboard:error="onLinkCopyError"
          ><b-icon-files></b-icon-files
        ></b-button>
      </div>
    </div>
  </div>
</template>
<script>
import _ from "lodash";

export default {
  layout: "innerPage",
  data() {
    return {
      xDomainData: _.cloneDeep(this.$store.state.functions.xDomainDefaults),
      yDomainData: _.cloneDeep(this.$store.state.functions.yDomainDefaults),
      functionData: "",
      generatedLink: "",
      lastLinkCopySuccess: false,
    };
  },
  mounted() {
    this.$store.commit("setTitle", "Configura la funzione in dettaglio");
  },
  computed: {
    chartLink() {
      const sessionData = [
        {
          identifier: "function",
          params: [
            {
              id: "fn",
              value: this.functionData,
            },
          ],
        },
        {
          identifier: "xDomain",
          params: [
            {
              id: "xMin",
              value: this.xDomainData.xMin,
            },
            {
              id: "xMax",
              value: this.xDomainData.xMax,
            },
            {
              id: "step",
              value: this.xDomainData.step,
            },
          ],
        },
        {
          identifier: "yDomain",
          params: [
            {
              id: "yMin",
              value: this.yDomainData.yMin,
            },
            {
              id: "yMax",
              value: this.yDomainData.yMax,
            },
            {
              id: "step",
              value: this.yDomainData.step,
            },
          ],
        },
      ];
      const sessionDataSerializer = this.$sessionDataSerializer;
      const encodedSessionData = sessionDataSerializer.encode(sessionData);
      return "/chart?sd=" + encodedSessionData;
    },
  },
  methods: {
    showChartLink() {
      this.generatedLink = this.chartLink;
    },
    goToChart() {
      this.$router.push(this.chartLink);
    },
    handleInsertedFunctionUpdate(insertedFunction) {
      console.log("aggiornamento funzione inserita", insertedFunction);
      this.functionData = insertedFunction.fnIntervalArith;
    },
    onLinkCopy() {
      this.lastLinkCopySuccess = true;
      this.showCopyAlert = true;
    },
    onLinkCopyError() {
      this.lastLinkCopySuccess = false;
      this.showCopyAlert = true;
    },
  },
};
</script>
