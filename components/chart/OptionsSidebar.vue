<template>
  <div>
    <VueAnnouncer />
    <b-sidebar
      @shown="handleShowSidebar"
      @hidden="(evt) => $emit('close')"
      ref="sidebar"
      backdrop
      close-label="Chiudi"
      :id="sidebarId"
      title="Opzioni"
      width="400px"
    >
      <ul class="px-3 py-2" :key="refreshKey" style="list-style-type: none">
        <!-- https://blog.codeminer42.com/how-to-use-dynamic-components-in-vue/ -->
        <li v-for="(item, index) in customizableOptions" :key="index">
          <ChartPinnableOption
            :initialIsFavorite="item.isFavorite"
            :optionData="item.data"
            :optionComponent="mapTypeComponent[item.identifier]"
            :optionIdentifier="item.identifier"
            @favoriteStateChange="
              (evtData) => $emit('optionStateChange', evtData)
            "
            @optionDataChange="(evtData) => $emit('optionDataChange', evtData)"
            @saveChanges="saveOptions"
            class="mb-3"
          />
        </li>
      </ul>
      <template #footer>
        <div class="d-flex bg-dark text-light align-items-center px-3 py-2">
          <strong class="mr-auto">Azioni</strong>
          <b-button size="sm" @click="saveAll">Salva tutto</b-button>
        </div>
      </template>
    </b-sidebar>
  </div>
</template>

<script>
export default {
  emits: [
    "optionStateChange",
    "optionDataChange",
    "saveChanges",
    "open",
    "close",
  ],
  data() {
    return {
      refreshKey: 0,
    };
  },
  props: {
    sidebarId: {
      type: String,
      required: true,
    },
    customizableOptions: {
      //ogni elemento sarà tipo {identifier:"optionId",data:{}, isFavorite: true}
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
    saveAll() {
      this.$emit("saveChanges", _.map(this.customizableOptions, "identifier"));
      this.$announcer.assertive("Salvataggio effettuato");
      this.$refs.sidebar.hide();
    },
    handleShowSidebar() {
      this.refreshKey += 1;
      this.$emit("open");
    },
    saveOptions(optionIdentifiers) {
      this.$emit("saveChanges", optionIdentifiers);
      this.$announcer.assertive("Salvataggio effettuato");
    },
  },
};
</script>
