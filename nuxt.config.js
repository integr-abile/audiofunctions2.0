export default {
  // Target: https://go.nuxtjs.dev/config-target
  target: "static",

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: "audiofunctions2.0",
    htmlAttrs: {
      lang: "en",
    },
    meta: [
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { hid: "description", name: "description", content: "" },
      { name: "format-detection", content: "telephone=no" },
    ],
    link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    { src: "~/plugins/vue-speech.js", mode: "client" },
    { src: "~/plugins/vue-resize.js", mode: "client" },
    { src: "~/plugins/mathlive-input.js", mode: "client" },
    { src: "~/plugins/vue-a11y-announcer.js", mode: "client" },
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/bootstrap
    "bootstrap-vue/nuxt",
  ],

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    extend(config, ctx) {
      if (ctx.isDev) {
        config.devtool = ctx.isClient ? "source-map" : "inline-source-map"; //per poter debuggare mettendo breakpoints negli hook direttamente del componente vue
      }
      config.resolve.alias["vue"] = "vue/dist/vue.common"; //serve per mathlive perchè mi da questo errore: https://github.com/nuxt/nuxt.js/issues/1142 . Nella doc di vue-mathlive è specificato che ci potrebbe essere (vedi "Caution" https://github.com/arnog/vue-mathlive )
    },
    transpile: ["function-plot", "mathlive"],
  },
};
