import * as Tone from "tone";
import _ from "lodash";

class SoundFactory {
  constructor(availableInstrumentNames) {
    //TODO: availableInstrumentNames è un array che indica quali nomi di strumenti sono ammessi tra quelli tra cui scegliere
  }
  #generatePitchClasses() {
    let notes = [
      "C",
      "C#",
      "D",
      "D#",
      "E",
      "F",
      "F#",
      "G",
      "G#",
      "A",
      "A#",
      "B",
    ];
    let octaves = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    var toReturn = [];
    for (let octave of octaves) {
      for (let note of notes) {
        toReturn.push(`${note}${octave}`);
      }
    }
    return toReturn;
  }
  InstrumentFrequencyType = {
    continuous: "continuous",
    discretePitchClassBased: "discretePitchClassBased",
  };
  #allPitchClasses = this.#generatePitchClasses();
  #allInstruments = [
    {
      name: "sine",
      instrument: new Tone.Oscillator(),
      instrumentType: this.InstrumentFrequencyType.continuous,
      frequencyRange: {
        min: 150,
        max: 2000,
      },
    },
    {
      name: "clarinet",
      instrument: new Tone.FMSynth({
        volume: 0,
        detune: 3,
        portamento: 0,
        harmonicity: 2,
        oscillator: {
          partialCount: 0,
          partials: [],
          phase: 0,
          type: "sine",
        },
        envelope: {
          attack: 0.21000000000000005,
          attackCurve: "linear",
          decay: 0.2,
          decayCurve: "exponential",
          release: 0.5,
          releaseCurve: "exponential",
          sustain: 1,
        },
        modulation: {
          partialCount: 0,
          partials: [],
          phase: 0,
          type: "triangle",
        },
        modulationEnvelope: {
          attack: 0.20000000000000004,
          attackCurve: "linear",
          decay: 0.01,
          decayCurve: "exponential",
          release: 0.5,
          releaseCurve: "exponential",
          sustain: 1,
        },
        modulationIndex: 1,
      }),
      instrumentType: this.InstrumentFrequencyType.continuous,
      frequencyRange: {
        min: 150,
        max: 2000,
      },
    },
    {
      name: "Guitar",
      instrument: new Tone.PluckSynth({
        attackNoise: 1,
        dampening: 500,
        resonance: 0.99,
      }),
      instrumentType: this.InstrumentFrequencyType.discretePitchClassBased,
      availablePitchClasses: this.pitchClasses("C3", "C6"),
    },
  ];
  getAllInstrumentsName() {
    return _.map(this.#allInstruments, "name");
  }

  pitchClasses(from, to) {
    // debugger;
    const beginIdx = this.#allPitchClasses.indexOf(from);
    const endIdx = this.#allPitchClasses.indexOf(to);
    return this.#allPitchClasses.slice(beginIdx, endIdx + 1);
  }
  sonify(yValue, yDistanceFromFunction, domXRange, domYRange, instrumentId) {}
}

const soundFactory = new SoundFactory();

export default ({ app }, inject) => {
  inject("soundFactory", soundFactory);
};
