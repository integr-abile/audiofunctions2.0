<template>
  <b-container>
    <h1 class="text-center m-4">Audiofunctions</h1>

    <b-row class="mb-4">
      <b-col cols="5">
        <b-card>
          <b-card-title>
            <h2>Guarda le funzioni matematiche da un'altra prospettiva</h2>
          </b-card-title>
          <b-card-text>
            Hai mai pensato di poter esplorare le funzioni matematiche
            attraverso il suono?
          </b-card-text>
          <NuxtLink to="/chart" class="btn btn-primary">Inizia subito</NuxtLink>
        </b-card>
      </b-col>
      <b-col>
        <b-img
          src="/screenshot_af.jpg"
          fluid
          rounded
          alt="screenshot della pagina del grafico di audiofunctions"
        ></b-img>
      </b-col>
    </b-row>
    <ul>
      <li v-for="feature in features" :key="feature.title">
        <b-row>
          <b-col>{{ feature.title }}</b-col>
          <b-col>{{ feature.description }}</b-col>
        </b-row>
      </li>
    </ul>
  </b-container>
</template>

<style>
html,
body,
#app,
#__nuxt,
#__layout {
  margin: 0;
  height: 100%;
  overflow: hidden;
}
body {
  --keyboard-zindex: 3000;
}
</style>

<script>
export default {
  data() {
    return {
      features: [
        {
          title: "Esplora le funzioni matematiche",
          description:
            "Grafica le funzioni matematiche e ascolta il suono che producono",
        },
        {
          title: "Esplora le funzioni matematiche",
          description:
            "Grafica le funzioni matematiche e ascolta il suono che producono",
        },
        {
          title: "Esplora le funzioni matematiche",
          description:
            "Grafica le funzioni matematiche e ascolta il suono che producono",
        },
      ],
    };
  },
};
</script>
