<template>
  <div>
    <div
      class="d-flex flex-column w-100 h-100"
      id="functionContainer"
      ref="fnContainer"
    >
      <div class="w-100 h-100" style="position: relative">
        <resize-observer @notify="handleResize" :emitOnMount="true" />

        <div role="application" tabindex="0" aria-label="area del grafico">
          <div id="root" aria-hidden="true"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      fnContainerWidth: 0,
      fnContainerHeight: 0,
    };
  },
  methods: {
    handleResize({ width, height }) {},
  },
};
</script>
