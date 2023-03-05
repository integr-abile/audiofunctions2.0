<template>
  <div>
    <Keypress key-event="keyup" :key-code="39" @success="handleKeyUp" />
  </div>
</template>

<script>
export default {
  props: ["isFunctionInteractionEnabled"],
  components: {
    Keypress: () => import("vue-keypress"),
  },
  methods: {
    handleKeyUp(event) {},
    handleKeyDown(event) {},
    handleKeyPress(event) {},
  },
};
</script>
