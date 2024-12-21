<template>
  <b-container>
    <h1 class="text-center m-4 display-1">Audiofunctions</h1>

    <b-row style="margin-bottom: 128px">
      <b-col cols="7">
        <b-card>
          <b-card-title>
            <h2 class="display-3">
              Observe la representación de funciones matemáticas desde una perspectiva diferente
            </h2>
          </b-card-title>
          <b-card-text class="py-3">
            <p class="lead">
              ¿Ha pensado alguna vez que podría explorar las funciones matemáticas
              a través del sonido?
            </p>
          </b-card-text>
          <div id="start-now" class="flex flex-column">
            <NuxtLink to="/quick-start" class="btn btn-primary btn-lg mr-2">
              Empezar
            </NuxtLink>
            <NuxtLink to="/chart" class="btn btn-primary btn-lg">
              Demostración
            </NuxtLink>
          </div>
        </b-card>
      </b-col>
      <b-col cols="5">
        <iframe
          src="https://www.youtube.com/embed/K4TOrB7at0Y?si=bLonZ736ZhazMx7L"
          title="YouTube video player"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerpolicy="strict-origin-when-cross-origin"
          allowfullscreen
          style="transform: translate(-50px, 25px); width: 100%; height: 75%"
        ></iframe>
      </b-col>
    </b-row>
    <!-- Caratteristiche -->
    <h2 class="text-center">Características principales</h2>
    <ul style="margin-top: 48px; margin-bottom: 128px">
      <li v-for="feature in features" :key="feature.title">
        <b-row>
          <b-col>
            <h3>{{ feature.title }}</h3></b-col
          >
          <b-col>{{ feature.description }}</b-col>
        </b-row>
        <hr />
      </li>
    </ul>
    <!-- Carosello immagini -->
    <h2 class="text-center">Algunas capturas de la aplicación</h2>
    <span class="sr-only">
      A continuación encontrará un carrusel de imágenes y sus explicaciones. Puede avanzar y retroceder en las diapositivas mediante los botones «Diapositiva anterior» y «Diapositiva siguiente» situados debajo del carrusel. Junto a estos botones hay un texto que indica el número de la diapositiva actual.
    </span>
    <b-row style="margin-bottom: 72px">
      <b-col>
        <ssr-carousel v-model="page" style="margin-top: 48px">
          <div v-for="slide in carouselSlides" :key="slide.title" class="slide">
            <b-jumbotron :header="slide.title" :lead="slide.description">
              <div class="d-flex justify-content-center">
                <b-img
                  thumbnail
                  fluid
                  :src="`/screenshot-carousel/${slide.image}`"
                  :alt="slide.imageAlt"
                  style="max-height: 400px"
                ></b-img>
              </div>
            </b-jumbotron>
          </div>
        </ssr-carousel>
        <div class="d-flex justify-content-center">
          <div class="d-flex align-items-center mr-2">
            Slide corrente: {{ page + 1 }}
          </div>
          <b-button
            :disabled="page == 0"
            class="mr-2"
            variant="outline-primary"
            @click="page--"
            >Slide precedente</b-button
          >
          <b-button
            :disabled="page == carouselSlides.length - 1"
            class="mr-2"
            variant="outline-primary"
            @click="page++"
            >Slide successiva</b-button
          >
        </div>
      </b-col>
    </b-row>
    <Footer></Footer>

    <!-- Footer -->
  </b-container>
</template>
<style scoped>
li {
  list-style-type: none;
}
#start-now {
  transform: scale(1.5) translate(100px, 25px);
}
</style>

<script>
export default {
  data() {
    return {
      page: 0,
      features: [
        {
          title: "Esplora le funzioni matematiche",
          description:
            "Visualizza grafici di funzioni matematiche e ascolta il suono corrispondente.",
        },
        {
          title: "Personalizza il suono",
          description:
            "Modifica il suono associato alle funzioni matematiche e scopri nuove combinazioni.",
        },
        {
          title: "Condividi i tuoi risultati",
          description:
            "Salva i tuoi grafici e i tuoi suoni preferiti e condividili con i tuoi amici.",
        },
      ],
      carouselSlides: [
        {
          title: "Slide 1",
          description: "Description 1",
          image: "sample-1.jpg",
          imageAlt: "Sample 1",
        },
        {
          title: "Slide 2",
          description: "Description 2",
          image: "sample-2.jpg",
          imageAlt: "Sample 2",
        },
        {
          title: "Slide 3",
          description: "Description 3",
          image: "sample-3.webp",
          imageAlt: "Sample 3",
        },
      ],
    };
  },
};
</script>
