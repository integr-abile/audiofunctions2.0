<template>
  <div></div>
</template>
<script>
export default {
  layout: "innerPage",
  mounted() {
    this.$store.commit("setTitle", "Quiénes somos");
  },
};
</script>
