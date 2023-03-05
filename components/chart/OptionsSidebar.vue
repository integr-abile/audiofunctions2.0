<template>
  <b-sidebar backdrop :id="sidebarId"> </b-sidebar>
</template>

<script>
export default {
  props: {
    sidebarId: String,
    required: true,
  },
};
</script>
