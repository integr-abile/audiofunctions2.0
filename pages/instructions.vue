<template>
  <div>
    <h2>Esplorazione</h2>
    <p>
      Puoi esplorare il grafico tramite sonificazione scegliendo tra tre modalità:
      <ul>
        <li>
          <b>Mono-dimensionale automatica</b>: premi il tasto B per avviare un'esplorazione sonora continua del grafico, da sinistra verso destra, senza necessità di interagire manualmente.
        </li>
        <li>
          <b>Mono-dimensionale interattiva</b>: utilizza i tasti freccia sinistra e destra della tastiera per spostarti lungo l’asse x e ascoltare il suono che rappresenta il valore y del punto corrispondente
        </li>
        <li>
          <b>Bi-dimensionale interattiva</b>: utilizza il mouse per muoverti liberamente sul piano cartesiano. Il suono riprodotto corrisponde ai punti del grafico: maggiore è la vicinanza del puntatore al grafico, più alto sarà il volume.
        </li>
      </ul>
    </p>
    <h2>Lista delle scorciatoie da tastiera</h2>
    Le seguenti scorciatoie da tastiera sono disponibili per semplificare l'uso di Audiofunctions e sono disponibili all'interno della pagina che mostra il grafico della funzione:
    <div v-html="keybindings"></div>
  </div>
</template>
<style>
kdb{
  background-color: #f8f9fa;
  padding: 2px;
  border: 1px solid black;
  border-radius: 3px;
  padding: 0.1em 0.3em;
  font-size: 0.9em;
  font-family: monospace;
  color: #333;
  margin: 0 0.2em;
}
</style>
<script>
export default {
  layout: "innerPage",
  mounted() {
    this.$store.commit("setTitle", "Istruzioni");
  },
  computed:{
    keybindings(){
      return this.$store.state.keybindings.list;
    }
  }
  
};
</script>
