<template>
  <div>
    <Keypress
      key-event="keyup"
      :key-code="$KeyboardKey.arrowRight"
      @success="handleKeyUp"
    />
    <Keypress
      key-event="keydown"
      :key-code="$KeyboardKey.arrowRight"
      @success="handleKeyDown"
    />
    <Keypress
      key-event="keyup"
      :key-code="$KeyboardKey.arrowLeft"
      @success="handleKeyUp"
    />
    <Keypress
      key-event="keydown"
      :key-code="$KeyboardKey.arrowLeft"
      @success="handleKeyDown"
    />
    <Keypress
      key-event="keyup"
      :key-code="$KeyboardKey.b"
      @success="sonifyBatch"
    />
    <Keypress
      key-event="keyup"
      :key-code="$KeyboardKey.x"
      @success="requestCurrentXInterval"
    />
    <Keypress
      key-event="keyup"
      :key-code="$KeyboardKey.y"
      @success="requestCurrentYInterval"
    />
    <Keypress
      key-event="keyup"
      :key-code="$KeyboardKey.c"
      @success="requestCurrentCoordinates"
    />
    <Keypress
      key-event="keyup"
      :key-code="$KeyboardKey.q"
      @success="readCurrentExpression"
    />
    <Keypress
      key-event="keyup"
      :key-code="$KeyboardKey.z"
      @success="handleZoom"
    />
    <!-- Drag -->
    <Keypress key-event="keyup" :key-code="$KeyboardKey.w" @success="dragUp" />
    <Keypress
      key-event="keyup"
      :key-code="$KeyboardKey.a"
      @success="dragLeft"
    />
    <Keypress
      key-event="keyup"
      :key-code="$KeyboardKey.s"
      @success="dragDown"
    />
    <Keypress
      key-event="keyup"
      :key-code="$KeyboardKey.d"
      @success="dragRight"
    />
  </div>
</template>

<script>
import _ from "lodash";

export default {
  emits: ["actionRequest"],
  props: ["isFunctionInteractionEnabled"],
  data() {
    return {
      holdKeyTimer: null,
    };
  },
  components: {
    Keypress: () => import("vue-keypress"),
  },
  methods: {
    dragUp(event) {
      this.$emit("actionRequest", this.$FunctionAction.dragUp);
    },
    dragLeft(event) {
      this.$emit("actionRequest", this.$FunctionAction.dragLeft);
    },
    dragDown(event) {
      this.$emit("actionRequest", this.$FunctionAction.dragDown);
    },
    dragRight(event) {
      this.$emit("actionRequest", this.$FunctionAction.dragRight);
    },
    handleZoom(event) {
      // console.log(event);
      if (event.event.shiftKey) {
        this.$emit("actionRequest", this.$FunctionAction.zoomOut);
      } else {
        this.$emit("actionRequest", this.$FunctionAction.zoomIn);
      }
    },
    handleKeyUp(event) {
      switch (event.event.keyCode) {
        case this.$KeyboardKey.arrowRight:
          if (this.holdKeyTimer != null) {
            this.$emit("actionRequest", this.$FunctionAction.endExploration);
            clearTimeout(this.holdKeyTimer);
            this.holdKeyTimer = null;
          }
          break;
        case this.$KeyboardKey.arrowLeft:
          if (this.holdKeyTimer != null) {
            this.$emit("actionRequest", this.$FunctionAction.endExploration);
            clearTimeout(this.holdKeyTimer);
            this.holdKeyTimer = null;
          }
          break;
      }
    },
    handleKeyDown(event) {
      switch (event.event.keyCode) {
        case this.$KeyboardKey.arrowRight:
          if (this.holdKeyTimer == null) {
            // this.$emit("actionRequest", this.$FunctionAction.beginExploration);
            var repeat = function () {
              this.$emit(
                "actionRequest",
                _.isNil(this.holdKeyTimer)
                  ? this.$FunctionAction.beginExplorationIncrement
                  : this.$FunctionAction.incrementStep
              );
              // this.$emit("actionRequest", this.$FunctionAction.incrementStep);
              this.holdKeyTimer = setTimeout(
                repeat,
                process.env
                  .INTERACTION_SONIFICATION_HOLD_KEY_TICK_TIME_SECONDS * 1000
              );
            }.bind(this); //è necessario bindare il this alla funzione, altrimenti verrebbe perso il this dell'istanza di Vue all'interno della funzione: https://lusaxweb.github.io/vuesax-blog/tips/scope_this.html#create-var
            repeat();
          }
          break;
        case this.$KeyboardKey.arrowLeft:
          if (this.holdKeyTimer == null) {
            // this.$emit("actionRequest", this.$FunctionAction.beginExploration);
            var repeat = function () {
              this.$emit(
                "actionRequest",
                _.isNil(this.holdKeyTimer)
                  ? this.$FunctionAction.beginExplorationDecrement
                  : this.$FunctionAction.decrementStep
              );
              this.holdKeyTimer = setTimeout(
                repeat,
                process.env
                  .INTERACTION_SONIFICATION_HOLD_KEY_TICK_TIME_SECONDS * 1000
              );
            }.bind(this); //è necessario bindare il this alla funzione, altrimenti verrebbe perso il this dell'istanza di Vue all'interno della funzione: https://lusaxweb.github.io/vuesax-blog/tips/scope_this.html#create-var
            repeat();
          }
          break;
      }
    },
    sonifyBatch(event) {
      this.$emit("actionRequest", this.$FunctionAction.batchExploration);
    },
    requestCurrentCoordinates(event) {
      this.$emit(
        "actionRequest",
        this.$FunctionAction.currentCoordinatesRequest
      );
    },
    requestCurrentXInterval(event) {
      this.$emit("actionRequest", this.$FunctionAction.currentXIntervalRequest);
    },
    requestCurrentYInterval(event) {
      this.$emit("actionRequest", this.$FunctionAction.currentYIntervalRequest);
    },
    readCurrentExpression(event) {
      this.$emit("actionRequest", this.$FunctionAction.readCurrentExpression);
    },
    handleKeyPress(event) {},
  },
};
</script>
