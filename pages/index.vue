<template>
  <b-container>
    <h1 class="text-center m-4 display-1">Audiofunctions</h1>

    <b-row style="margin-bottom: 128px">
      <b-col class="order-2 order-lg-1" cols="12" lg="7">
        <b-card>
          <b-card-title>
            <h2 class="display-3">
              Guarda le funzioni matematiche da un'altra prospettiva
            </h2>
          </b-card-title>
          <b-card-text class="py-3">
            <p class="lead">
              Hai mai pensato di poter esplorare le funzioni matematiche
              attraverso il suono?
            </p>
          </b-card-text>
          <div id="start-now" class="flex flex-column">
            <NuxtLink to="/chart" class="btn btn-primary btn-lg">
              Inizia subito
            </NuxtLink>
          </div>
        </b-card>
      </b-col>
      <b-col class="order-1 order-lg-2" cols="12" lg="5">
        <iframe
          src="https://www.youtube.com/embed/K4TOrB7at0Y?si=bLonZ736ZhazMx7L"
          class="sized"
          title="YouTube video player"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerpolicy="strict-origin-when-cross-origin"
          allowfullscreen
        ></iframe>
      </b-col>
    </b-row>
    <h2 class="text-center my-4">Cos'è Audiofunctions</h2>
    <p>Audiofunctions è un progetto innovativo del <a href="http://www.integr-abile.unito.it/">Laboratorio “S. Polin” del Dipartimento di Matematica “G. Peano” dell’Università degli Studi di Torino</a> che permette di esplorare i grafici di funzioni a una variabile reale con un approccio multimodale. </p>
    <p>Lo studio di grafici di funzione si trasformerà in un'esperienza multisensoriale! Grazie alle tecniche di sonificazione, puoi esplorare i grafici non solo con la vista, attraverso il classico piano cartesiano, ma anche con l’udito, ascoltando l’andamento della funzione attraverso i suoni.</p>
    <p>In classe, questo strumento offre un’opportunità unica per rendere i grafici di funzione accessibili a tutti gli studenti, favorendo un apprendimento innovativo delle STEM e consentendo la progettazione di attività didattiche inclusive che rispondano alle esigenze di ogni alunno.</p>
    <hr class="my-4">
    <!-- Caratteristiche -->
    <h2 class="text-center my-4">Principali caratteristiche</h2>
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
    <h2 class="text-center">Alcuni screenshot dell'applicazione</h2>
    <span class="sr-only">
      Di seguito è presente un carosello di immagini e relative spiegazioni. è
      possibile andare avanti e indietro nelle slide attraverso i bottoni "Slide
      precedente" e "Slide successiva" posti sotto il carosello. Accanto a
      questi bottoni c'è un testo che indica il numero della slide corrente
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
.sized{
  width: 100%;
  height: 50vh;
}
@media (min-width: 992px) {
  .sized {
    width: 100%;
    height: 75%;
    transform: translate(-50px, 25px);
  }
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
          title: "Esplorazione Mono-dimensionale automatica",
          description: "Premi il tasto B e senti la sonificazione di tutta la funzione da sinistra a destra",
          image: "keyboard-batch-exploration.jpeg",
          imageAlt: "Grafico tratto da Audiofunctions con in sovraimpressione il tasto B e un'indicazione visiva del progresso dell'esplorazione a partire da un punto della funzione. Sotto il grafico un'icona di una tastiera per computer",
        },
        {
          title: "Esplorazione Mono-dimensionale interattiva",
          description: "usa i tasti freccia per muoverti orizzontalmente lungo l'asse x e ascoltare la funzione",
          image: "keyboard-exploration.jpeg",
          imageAlt: "Grafico tratto da Audiofunctions con evidenziato un punto della funzione e il relativo valore sull'asse x. Un indicatore visivo collega questi due punti. In sovraimpressione i tasti freccia e sotto il grafico l'icona di una tastiera per computer",
        },
        {
          title: "Esplorazione Bi-dimensionale interattiva",
          description: "muoviti liberamente con il mouse sull'area del grafico",
          image: "mouse-exploration.jpeg",
          imageAlt: "Grafico tratto da Audiofunctions con evidenziati 3 punti: uno sulla funzione, la relativa ascissa e la posizione del puntatore del mouse all'interno dell'area del grafico. Sotto il grafico l'icona del mouse",
        },
        {
          title: "Sonificazione",
          description: "Scegli l'opzione che preferisci: Clarinetto per la sonificazione continua, Chitarra per la sonificazione discreta",
          image: "sonification-option.png",
          imageAlt: "Pannello delle opzioni con evidenziato il blocco delle opzioni per la sonificazione. Sono presenti due opzioni in un menu a tendina: Clarinetto e Chitarra",
        },
        {
          title: "Funzioni",
          description: "visualizza la funzione corrente ed inserisci nella box la tua nuova funzione",
          image: "function-option.png",
          imageAlt: "Pannello delle opzioni con evidenziato il blocco per l'inserimento della funzione",
        },
        {
          title: "Opzione assi",
          description: "Imposta l'ampiezza dell'asse x e dell'asse y a seconda delle tue esigenze",
          image: "axis-options.png",
          imageAlt: "Pannello delle opzioni con evidenziato il blocco per la personalizzazione dell'intervallo visualizzato sull'asse x e sull'asse y",
        },
        {
          title: "Coordinate del punto",
          description: "Premi il tasto C e potrai sapere le coordinate x, y del punto corrente sulla funzione",
          image: "audiofunctions-tasto-c.png",
          imageAlt: "Screenshot del grafico di Audiofunctions con evidenziata una casella di testo con scritte le coordinate x e y del punto corrente x e y evidenziato anche sull'area del grafico. In sovraimpressione al grafico il tasto C che richiede la visualizzazione delle coordinate e sotto l'icona di una tastiera",
        },
      ],
    };
  },
};
</script>
