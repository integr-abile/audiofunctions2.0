<template>
  <div>
    <h2>List of Keyboard Shortcuts</h2>
    The following keyboard shortcuts are available to simplify the use of Audiofunctions and are accessible within the page displaying the function graph:
    <ul>
      <li>
        <kdb>f</kdb> and <kdb>Shift</kdb>+<kdb>f</kdb> to move forward and backward through predefined functions
      </li>
      <li>
        <kdb>v</kdb> to toggle the volume of the audio produced by the function
      </li>
      <li>
        <kdb>x</kdb> to reveal the value of the displayed range on the X-axis
      </li>
      <li>
        <kdb>y</kdb> to reveal the value of the displayed range on the Y-axis
      </li>
      <li>
        <kdb>c</kdb> to reveal the value of the current coordinate
      </li>
      <li>
        <kdb>i</kdb> to change the instrument used to sonify the function (currently switches between clarinet and guitar)
      </li>
      <li>
        <kdb>z</kdb> and <kdb>Shift</kdb>+<kdb>z</kdb> to zoom in and out. The zoom center is around the current coordinates of the function
      </li>
      <li>
        <kdb>w</kdb> <kdb>a</kdb> <kdb>s</kdb> <kdb>d</kdb> to move along the X and Y axes similar to how it's done in video games:
        <ul>
          <li><kdb>w</kdb> to move up</li>
          <li><kdb>a</kdb> to move left</li>
          <li><kdb>s</kdb> to move down</li>
          <li><kdb>d</kdb> to move right</li>
        </ul>
      </li>
      <li>
        <kdb>o</kdb> opens/closes the side panel of available options. The panel can also be closed using the <kdb>Esc</kdb> key
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
    this.$store.commit("setTitle", "Istruzioni");
  },
};
</script>
