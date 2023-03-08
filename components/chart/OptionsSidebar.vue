<template>
  <b-sidebar backdrop :id="sidebarId" title="Opzioni">
    <div class="px-3 py-2">
      <!-- TODO: inserire vari componenti dinamici-->
      <!-- https://blog.codeminer42.com/how-to-use-dynamic-components-in-vue/ -->
      <component
        v-for="(item, index) in customizableOptionsData"
        :key="index"
        :data="item.data"
        :is="mapTypeComponent[item.identifier]"
      ></component>
    </div>
  </b-sidebar>
</template>

<script>
import OptionXDomain from "../option/XDomain.vue";

export default {
  components: { OptionXDomain },
  props: {
    sidebarId: {
      type: String,
      required: true,
    },
    customizableOptionsData: {
      type: Array,
      default() {
        return [];
      },
    },
  },
  computed: {
    mapTypeComponent() {
      return {
        xDomain: OptionXDomain,
      };
    },
  },
};
</script>
