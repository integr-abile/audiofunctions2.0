<template>
  <div>
    <h2>Dominio asse Y</h2>
    <b-form inline>
      <label for="min-x-domain-value" class="sr-only"
        >valore minimo di Y mostrato sul grafico</label
      >
      <b-form-input
        id="min-x-domain-value"
        class="mr-1"
        placeholder="0"
        style="width: 52px"
      >
      </b-form-input>
      <span class="mr-1"> &lt;= x &lt;= </span>

      <label for="min-x-domain-value" class="sr-only"
        >valore massimo di Y mostrato sul grafico</label
      >
      <b-form-input id="min-x-domain-value" placeholder="0" style="width: 52px">
      </b-form-input>
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
      yMin: 0,
      yMax: 0,
      step: 0,
    };
  },
};
</script>
