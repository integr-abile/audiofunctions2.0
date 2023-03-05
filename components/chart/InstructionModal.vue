<template>
  <b-modal :id="modalId" centered scrollable></b-modal>
</template>

<script>
export default {
  props: {
    modalId: String,
    required: true,
  },
};
</script>
