<template>
  <div class="p-2 rounded border border-2 w-100">
    <div class="d-flex align-items-start mb-4">
      <component
        class="flex-grow-1"
        :is="optionComponent"
        :optionData="currentOptionData"
        @optionDataChange="handleOptionDataChange"
        :key="refreshKey"
      />
      <!-- Le icone di bootstrap sono di default larghe 1em da documentazione, quindi tengo il container un po' più largo-->
      <div class="d-flex justify-content-end" style="width: 3em">
        <b-button
          variant="outline-info"
          size="sm"
          :title="favoriteActionMessage"
          @click="toggleFavoriteState"
        >
          <b-icon :icon="favoriteStateIcon" aria-hidden="true"></b-icon>
        </b-button>
      </div>
    </div>
    <div class="d-flex justify-content-end">
      <b-button size="sm" @click="salvaModifiche">Applica</b-button>
    </div>
  </div>
</template>

<script>
export default {
  emits: ["favoriteStateChange", "optionDataChange", "saveChanges"],
  props: [
    "optionIdentifier",
    "optionData",
    "optionComponent",
    "initialIsFavorite",
  ],
  data() {
    return {
      isFavorite: false,
      currentOptionData: {},
      refreshKey: 0,
    };
  },
  watch: {
    optionData(val) {
      console.log("aggiornati dai in pinnable option");
      this.currentOptionData = val;
    },
  },
  created() {
    this.currentOptionData = this.optionData;
    this.isFavorite = this.initialIsFavorite;
  },
  computed: {
    favoriteStateIcon() {
      return this.isFavorite ? "star-fill" : "star";
    },
    favoriteActionMessage() {
      return this.isFavorite ? "Togli dai preferiti" : "Aggiungi ai preferiti";
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
      this.$emit("saveChanges", [this.optionIdentifier]);
      this.refreshKey++;
    },
  },
};
</script>
