export const state = () => ({
    list:`
    <ul>
      <li>
        <kdb>f</kdb> e <kdb>Shift</kdb>+<kdb>f</kdb> per andare avanti e indietro tra le funzioni predefinite
      </li>
      <li>
        <kdb>v</kdb> per attivare/disattivare il volume dell'audio prodotto dalla funzione
      </li>
      <li>
        <kdb>x</kdb> per rivelare il valore dell'intervallo visualizzato sull'asse X
      </li>
      <li>
        <kdb>y</kdb> per rivelare il valore dell'intervallo visualizzato sull'asse Y
      </li>
      <li>
        <kdb>c</kdb> per rivelare il valore della coordinata corrente
      </li>
      <li>
        <kdb>i</kdb> per cambiare strumento col quale sonificare la funzione (per ora cambio tra clarinetto e chitarra)
      </li>
      <li>
        <kdb>z</kdb> e <kdb>Shift</kdb>+<kdb>z</kdb> per zoomare avanti e indietro. Il centro dello zoom è attorno alle coordinate correnti della funzione
      </li>
      <li><kdb>w</kdb> <kdb>a</kdb> <kdb>s</kdb> <kdb>d</kdb> per muoversi lungo gli assi X e Y in modo analogo a come avviene nei videogiochi:
        <ul>
          <li><kdb>w</kdb> per muoversi in alto</li>
          <li><kdb>a</kdb> per muoversi a sinistra</li>
          <li><kdb>s</kdb> per muoversi in basso</li>
          <li><kdb>d</kdb> per muoversi a destra</li>
        </ul>
      </li>
      <li>
        <kdb>o</kdb> apre/chiude il pannello laterale delle opzioni disponibili. Il pannello è chiudibile anche attraverso il tasto <kdb>Esc</kdb>
      </li>
      <li>
        <kdb>h</kdb> per nascondere la finestra con l'ultimo messaggio visualizzato
      </li>
      <li>
        <kdb>k</kdb> per mostrare la lista delle scorciatoie da tastiera
      </li>
    </ul>`
    });

export const getters = {
    getKeybindings(state) {
        return state.list;
    }
};