<template>
  <b-sidebar backdrop :id="sidebarId" title="Opzioni">
    <div class="px-3 py-2">
      <!-- TODO: inserire vari componenti dinamici-->
      <!-- https://blog.codeminer42.com/how-to-use-dynamic-components-in-vue/ -->
      <ChartPinnableOption
        v-for="(item, index) in customizableOptions"
        :key="index"
        :optionData="item.data"
        :optionComponent="mapTypeComponent[item.identifier]"
        :optionIdentifier="item.identifier"
        @onFavoriteStateChange="
          (evtData) => $emit('optionStateChange', evtData)
        "
      />
    </div>
  </b-sidebar>
</template>

<script>
import OptionXDomain from "../option/XDomain.vue";

export default {
  emits: ["optionStateChange"],
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
};
</script>
