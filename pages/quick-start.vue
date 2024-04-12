<template>
  <div></div>
</template>
<script>
export default {
  layout: "innerPage",
  mounted() {
    this.$store.commit("setTitle", "Crea la tua prima funzione");
  },
};
</script>
