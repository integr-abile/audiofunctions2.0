<template>
  <div></div>
</template>
<script>
export default {
  layout: "innerPage",
  mounted() {
    this.$store.commit("setTitle", "Configura la funzione in dettaglio");
  },
};
</script>
