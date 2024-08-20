<template>
  <div>
    <NavBar />
    <b-container>
      <h1 class="text-center mb-3">{{ title }}</h1>
      <Nuxt />
      <Footer style="margin-top: 72px;"></Footer>
    </b-container>
  </div>
</template>

<script>
export default {
  computed: {
    title() {
      return this.$store.state.title;
    },
  },
};
</script>
