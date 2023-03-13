<template>
  <div>
    <h2>Dominio asse X</h2>
    <b-form>
      <div class="d-flex">
        <label for="min-x-domain-value" class="sr-only"
          >valore minimo di X mostrato sul grafico</label
        >
        <b-form-input
          id="min-x-domain-value"
          class="mr-1"
          type="number"
          placeholder="0"
          style="width: 80px"
        >
        </b-form-input>
        <!-- <span class="mr-1 text-center"> &lt;= x &lt;= </span> -->
        <vue-mathjax :formula="formula"></vue-mathjax>

        <label for="min-x-domain-value" class="sr-only"
          >valore massimo di X mostrato sul grafico</label
        >
        <b-form-input
          id="min-x-domain-value"
          type="number"
          placeholder="0"
          style="width: 80px"
        >
        </b-form-input>
      </div>
    </b-form>
  </div>
</template>

<script>
export default {
  props: {
    data: Object,
  },
  data() {
    return {
      formula: "$$<= x <=$$",
      xMin: 0,
      xMax: 0,
      step: 0,
    };
  },
};
</script>
