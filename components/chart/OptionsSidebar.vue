<template>
  <div>
    <!-- <VueAnnouncer /> -->
    <b-sidebar
      @shown="handleShowSidebar"
      @hidden="handleCloseSidebar"
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
            class="mb-3"
            :initialIsFavorite="item.isFavorite"
            :optionData="item.data"
            :optionComponent="mapTypeComponent[item.identifier]"
            :optionIdentifier="item.identifier"
            @favoriteStateChange="
              (evtData) => $emit('optionStateChange', evtData)
            "
            @optionDataChange="(evtData) => $emit('optionDataChange', evtData)"
            @saveChanges="saveOptions"
          />
        </li>
      </ul>
      <template #footer>
        <Keypress
          v-if="isSidebarOpen"
          key-event="keyup"
          :key-code="$KeyboardKey.enter"
          @success="saveAll"
        />
        <div class="d-flex bg-dark text-light align-items-center px-3 py-2">
          <strong class="mr-auto">v{{ version }}</strong>
          <b-button size="sm" @click="saveAll">Salva tutto</b-button>
        </div>
      </template>
    </b-sidebar>
  </div>
</template>

<script>
import appVersion from "~/assets/version.js";
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
      isSidebarOpen: false,
      version: appVersion,
    };
  },
  components: {
    Keypress: () => import("vue-keypress"),
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
      console.log("salvataggio tutte le opzioni");

      this.$emit("saveChanges", _.map(this.customizableOptions, "identifier"));
      this.$announcer.polite("Salvataggio effettuato");
      this.$refs.sidebar.hide();
    },
    handleShowSidebar() {
      this.refreshKey += 1;
      this.$emit("open");
      this.isSidebarOpen = true;
    },
    handleCloseSidebar() {
      this.refreshKey += 1;
      this.$emit("close");
      this.isSidebarOpen = false;
    },
    saveOptions(optionIdentifiers) {
      this.$emit("saveChanges", optionIdentifiers);
      this.$announcer.polite("Salvataggio effettuato");
    },
  },
};
</script>
