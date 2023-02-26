export default {
  // Target: https://go.nuxtjs.dev/config-target
  target: "static",
  ssr: false,
  server: {
    port: 3000,
  },

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: "af20",
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
  css: ["mathlive/dist/mathlive-fonts.css"],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    // "~/plugins/vue-speech.js",
    /*{ src: "~/plugins/chart.js", ssr: false }*/
    { src: "~/plugins/vue-speech.js", mode: "client" },
    { src: "~/plugins/vue-resize.js", mode: "client" },
    { src: "~/plugins/mathlive-input.js", mode: "client" },
    { src: "~/plugins/vue-a11y-announcer.js", mode: "client" },
    // { src: "~/plugins/vue-keypress.js" },
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/tailwindcss
    // '@nuxtjs/tailwindcss',
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: ["bootstrap-vue/nuxt"],
  bootstrapVue: {
    icons: true,
  },

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
