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
      :multiple-keys="fnBatchExplorationMultipleKeys"
      @success="sonifyBatch"
    />
  </div>
</template>

<script>
export default {
  emits: ["actionRequest"],
  props: ["isFunctionInteractionEnabled"],
  data() {
    return {
      holdKeyTimer: null,
      fnBatchExplorationMultipleKeys: [
        {
          keyCode: this.$KeyboardKey.b,
          modifiers: ["ctrlKey", "shiftKey"],
          preventDefault: true,
        },
      ],
    };
  },
  components: {
    Keypress: () => import("vue-keypress"),
  },
  methods: {
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
            this.$emit("actionRequest", this.$FunctionAction.beginExploration);
            var repeat = function () {
              this.$emit("actionRequest", this.$FunctionAction.incrementStep);
              this.holdKeyTimer = setTimeout(
                repeat,
                process.env.INTERACTION_SONIFICATION_HOLD_KEY_TICK_TIME_SECONDS
              );
            }.bind(this); //è necessario bindare il this alla funzione, altrimenti verrebbe perso il this dell'istanza di Vue all'interno della funzione: https://lusaxweb.github.io/vuesax-blog/tips/scope_this.html#create-var
            repeat();
          }
          break;
        case this.$KeyboardKey.arrowLeft:
          if (this.holdKeyTimer == null) {
            this.$emit("actionRequest", this.$FunctionAction.beginExploration);
            var repeat = function () {
              this.$emit("actionRequest", this.$FunctionAction.decrementStep);
              this.holdKeyTimer = setTimeout(
                repeat,
                process.env.INTERACTION_SONIFICATION_HOLD_KEY_TICK_TIME_SECONDS
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
    handleKeyPress(event) {},
  },
};
</script>
