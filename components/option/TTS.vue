<template>
  <div>
    <h2>Messaggi Info funzione automatici</h2>
    <div class=".d-flex flex-column">
      <b-form-group>
        <b-form-checkbox-group
          id="tts-checks"
          v-model="currentCheckSelected"
          :options="options"
        >
        </b-form-checkbox-group>
      </b-form-group>
    </div>
  </div>
</template>
<script>
import _ from "lodash";

export default {
  emits: ["optionDataChange"],
  props: {
    optionData: Object,
  },
  data() {
    return {
      currentOptionData: {},
      currentCheckSelected: [],
      options: [],
    };
  },
  watch: {
    currentCheckSelected(val) {
      //reset
      _.forEach(this.currentOptionData.speechPermissions, function (item) {
        item.canPlayAutomatically = false;
      });
      //set in base ai nuovi valori
      _.forEach(
        val,
        function (selectedId) {
          //   debugger;
          const idxToSet = _.findIndex(
            this.currentOptionData.speechPermissions,
            {
              identifier: selectedId,
            }
          );
          this.currentOptionData.speechPermissions[
            idxToSet
          ].canPlayAutomatically = true;
        }.bind(this)
      );
      this.$emit("optionDataChange", this.currentOptionData);
    },
  },

  created() {
    this.updateOptionData(this.optionData);
  },
  methods: {
    updateOptionData(currentValues) {
      this.currentOptionData = currentValues;
      this.options = _.map(
        this.currentOptionData.speechPermissions,
        function (permission) {
          //   debugger;
          if (permission.canPlayAutomatically) {
            this.currentCheckSelected.push(permission.identifier);
          }
          return {
            text: permission.identifier.replaceAll("-", " "),
            value: permission.identifier,
          };
        }.bind(this)
      );
    },
  },
};
</script>
