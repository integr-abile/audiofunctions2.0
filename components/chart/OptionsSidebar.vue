<template>
  <b-sidebar ref="sidebar" backdrop :id="sidebarId" title="Opzioni">
    <div class="px-3 py-2">
      <!-- https://blog.codeminer42.com/how-to-use-dynamic-components-in-vue/ -->
      <ChartPinnableOption
        v-for="(item, index) in customizableOptions"
        :key="index"
        :optionData="item.data"
        :optionComponent="mapTypeComponent[item.identifier]"
        :optionIdentifier="item.identifier"
        @favoriteStateChange="(evtData) => $emit('optionStateChange', evtData)"
        @optionDataChange="(evtData) => $emit('optionDataChange', evtData)"
        class="mb-3"
      />
    </div>
    <template #footer>
      <div class="d-flex bg-dark text-light align-items-center px-3 py-2">
        <strong class="mr-auto">Azioni</strong>
        <b-button size="sm" @click="save">Salva tutto</b-button>
      </div>
    </template>
  </b-sidebar>
</template>

<script>
import OptionXDomain from "../option/XDomain.vue";

export default {
  emits: ["optionStateChange", "optionDataChange"],
  components: { OptionXDomain },
  props: {
    sidebarId: {
      type: String,
      required: true,
    },
    customizableOptions: {
      type: Array,
      default() {
        return [];
      },
    },
    mapTypeComponent: {
      type: Object,
      required: true,
    },
  },
  methods: {
    save() {
      this.$refs.sidebar.hide();
    },
  },
};
</script>
