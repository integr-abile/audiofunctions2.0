<template>
  <div>
    <h2>Messaggi Info funzione</h2>
    <div class=".d-flex flex-column">
      <b-form-group>
        <b-form-checkbox-group
          id="tts-checks"
          v-model="currentCheckSelected"
          :options="options"
          class="mb-2"
        >
        </b-form-checkbox-group>
        <div class="d-flex">
          <div class="d-flex align-items-center">
            <label for="voice-type" class="mr-2">Voce: </label>
            <b-form-select
              id="voice-type"
              v-model="selectedVoice"
              :options="availableVoicesDescription"
            >
            </b-form-select>
          </div>
        </div>
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
      selectedVoice: null,
    };
  },
  computed: {
    availableVoicesDescription() {
      return _.map(this.optionData.availableVoices, function (voiceObj) {
        return `${voiceObj.name} [${voiceObj.lang}]`;
      });
    },
  },
  watch: {
    currentCheckSelected(val) {
      //reset
      _.forEach(this.currentOptionData.speechPermissions, function (item) {
        if (_.has(item, "canPlayAutomatically")) {
          item.canPlayAutomatically = false;
        }
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
          if (
            _.has(
              this.currentOptionData.speechPermissions[idxToSet],
              "canPlayAutomatically"
            )
          ) {
            this.currentOptionData.speechPermissions[
              idxToSet
            ].canPlayAutomatically = true;
          }
        }.bind(this)
      );
      this.$emit("optionDataChange", this.currentOptionData);
    },
    selectedVoice(val) {
      console.log("selezionata voce " + val);
      this.currentOptionData.selectedVoice = val;
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
          if (
            permission.canPlayAutomatically ||
            !_.has(permission, "canPlayAutomatically") //metto questa logica perchè assumo che se un permesso non ha quella chiave è abilitato, ma da gestire su trigger manuale. Se non ho il permesso non lo vedo nemmeno nella lista
          ) {
            this.currentCheckSelected.push(permission.identifier);
          }
          //   debugger;
          return {
            text: permission.identifier.replaceAll("-", " "),
            value: permission.identifier,
            disabled: !_.has(permission, "canPlayAutomatically"),
          };
        }.bind(this)
      );
      this.selectedVoice = currentValues.selectedVoice;
    },
  },
};
</script>
