<template>
  <div>
    <h2>Lista de atajos del teclado</h2>
    <p>Los siguientes atajos de teclado están disponibles para simplificar el uso de Audiofunctions y son accesibles dentro de la página que muestra el gráfico de la función:</p>
    <ul>
      <li>
        <kdb>f</kdb> y <kdb>Mayúscula</kdb>+<kdb>f</kdb> avanzar y retroceder a través de funciones predefinidas
      </li>
      <li>
        <kdb>v</kdb> para cambiar el volumen del audio producido por la función
      </li>
      <li>
        <kdb>x</kdb> para mostrar el valor del rango visualizado en el eje X
      </li>
      <li>
        <kdb>y</kdb> para mostrar el valor del rango visualizado en el eje Y
      </li>
      <li>
        <kdb>c</kdb> para mostrar el valor de la coordenada actual
      </li>
      <li>
        <kdb>i</kdb> para cambiar el instrumento utilizado para sonorizar la función (actualmente cambia entre clarinete y guitarra)
      </li>
      <li>
        <kdb>z</kdb> y <kdb>Mayúscula</kdb>+<kdb>z</kdb> para acercar y alejar la imagen. El centro del zoom está alrededor de las coordenadas actuales 
      </li>
      <li>
        <kdb>w</kdb> <kdb>a</kdb> <kdb>s</kdb> <kdb>d</kdb> para moverse por los ejes X e Y de forma similar a como se hace en los videojuegos.:
        <ul>
          <li><kdb>w</kdb> desplazarse hacia arriba</li>
          <li><kdb>a</kdb> desplazarse a la izquierda</li>
          <li><kdb>s</kdb> desplazarse hacia abajo</li>
          <li><kdb>d</kdb> desplazarse a la derecha</li>
        </ul>
      </li>
      <li>
        <kdb>o</kdb> abre/cierra el panel lateral de opciones disponibles. El panel se puede cerrar con la tecla <kdb>Esc</kdb> 
      </li>
    </ul>
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
    this.$store.commit("setTitle", "Instrucciones");
  },
};
</script>


