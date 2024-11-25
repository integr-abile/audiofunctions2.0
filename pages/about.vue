<template>
  <div>
    <p>Il Laboratorio per la Ricerca e la Sperimentazione di Nuove Tecnologie Assistive per le STEM "S. Polin" fa parte del Dipartimento di Matematica “G.Peano” dell’Università di Torino.</p>
    <p>
      Le attività del laboratorio si svolgono in due direzioni parallele, da una parte sviluppare nuove soluzioni tecnologiche e testare, adattare e diffondere le tecnologie già esistenti allo scopo di risolvere i problemi relativi all’accesso dei contenuti STEM da parte di studenti con disabilità (sia motoria che sensoriale); dall’altra lo studio e la ricerca in didattica della matematica dei processi cognitivi e di coinvolgimento di differenti registri semiotici per l’accesso ai contenuti STEM.
    </p>
    <p>
      Il principio ispiratore del Laboratorio è garantire il diritto allo studio, diritto fondamentale ed inalienabile della persona, sancito nel diritto internazionale dalla Dichiarazione Universale dei Diritti Umani dell'ONU. Gli sforzi del Laboratorio sono quindi concentrati sulla soluzione di un problema tuttora aperto: garantire l'accessibilità per tutti di contenuti scientifici e testi che contengono formule, grafici, diagrammi e tabelle.
    </p>
    <p>
      Ciò che ci guida è la convinzione che lo studio di materie scientifiche da parte di persone con disabilità non sia una missione impossibile ma piuttosto una sfida possibile.
    </p>
    <p>
      Il gruppo di progetto si avvale della collaborazione di: professori, ricercatori, tecnici della ricerca, borsisti di ricerca, dottorandi e assegnisti del Dipartimento di Matematica e del Dipartimento di Informatica dell’Università di Torino, numerosi collaboratori e sperimentatori volontari (tra cui persone con disabilità visiva).
    </p>
    <p>
      Audiofunctions è uno dei progetti in corso del Laboratorio, per ulteriori informazioni consultare il sito <a href="http://www.integr-abile.unito.it/">www.integr-abile.unito.it</a>
    </p>
  </div>
</template>
<script>
export default {
  layout: "innerPage",
  mounted() {
    this.$store.commit("setTitle", "Chi siamo");
  },
};
</script>
