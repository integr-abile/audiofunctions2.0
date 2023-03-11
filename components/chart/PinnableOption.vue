<template>
  <div class="w-100">
    <div class="d-flex align-items-center">
      <component
        class="flex-grow-1"
        :is="optionComponent"
        :data="currentOptionData"
      />
      <!-- Le icone di bootstrap sono di default larghe 1em da documentazione, quindi tengo il container un po' più largo-->
      <div class="d-flex justify-content-center" style="width: 1.5em">
        <b-icon @click="toggleFavoriteState" :icon="favoriteStateIcon"></b-icon>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  emits: ["onFavoriteStateChange"],
  props: ["optionIdentifier", "optionData", "optionComponent"],
  data() {
    return {
      isFavorite: false,
      currentOptionData: this.optionData,
    };
  },
  computed: {
    favoriteStateIcon() {
      return this.isFavorite ? "star-fill" : "star";
    },
  },
  methods: {
    toggleFavoriteState() {
      this.isFavorite = !this.isFavorite;
      this.$emit("onFavoriteStateChange", {
        identifier: this.optionIdentifier,
        data: this.currentOptionData,
        isFavorite: this.isFavorite,
      });
    },
  },
};
</script>
