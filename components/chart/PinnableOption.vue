<template>
  <div class="p-2 rounded border border-2 w-100">
    <div class="d-flex align-items-start mb-4">
      <component
        class="flex-grow-1"
        :is="optionComponent"
        :optionData="currentOptionData"
        @onOptionDataChange="handleOptionDataChange"
      />
      <!-- Le icone di bootstrap sono di default larghe 1em da documentazione, quindi tengo il container un po' più largo-->
      <div class="d-flex justify-content-center" style="width: 1.5em">
        <b-icon @click="toggleFavoriteState" :icon="favoriteStateIcon"></b-icon>
      </div>
    </div>
    <div class="d-flex justify-content-end">
      <b-button size="sm" @click="salvaModifiche">Applica</b-button>
    </div>
  </div>
</template>

<script>
export default {
  emits: ["favoriteStateChange", "optionDataChange"],
  props: ["optionIdentifier", "optionData", "optionComponent"],
  data() {
    return {
      isFavorite: false,
      currentOptionData: {},
    };
  },
  watch: {
    optionData(val) {
      this.currentOptionData = val;
    },
  },
  created() {
    this.currentOptionData = this.optionData;
  },
  computed: {
    favoriteStateIcon() {
      return this.isFavorite ? "star-fill" : "star";
    },
  },
  methods: {
    toggleFavoriteState() {
      this.isFavorite = !this.isFavorite;
      this.$emit("favoriteStateChange", {
        identifier: this.optionIdentifier,
        data: this.currentOptionData,
        isFavorite: this.isFavorite,
      });
    },
    handleOptionDataChange(newData) {
      this.currentOptionData = newData;
      this.$emit("optionDataChange", {
        optionData: this.currentOptionData,
        isFavorite: this.isFavorite,
        optionIdentifier: this.optionIdentifier,
      });
    },
    salvaModifiche() {
      //TODO: qua le modifiche dovrebbero propagarsi direttamente al grafico
      // this.$emit("optionDataChange", {
      //   optionData: this.currentOptionData,
      //   isFavorite: this.isFavorite,
      //   optionIdentifier: this.optionIdentifier,
      // });
    },
  },
};
</script>
