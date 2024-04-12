<template>
  <div>
    <NavBar />
    <b-container>
      <h1 class="text-center">{{ title }}</h1>
      <Nuxt />
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
