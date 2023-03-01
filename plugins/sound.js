import * as Tone from "tone";

//TODO: definire della variabili che specificano i pitch class del clarinetto e della chitarra
const InstrumentFrequencyType = {
  continuous: "continuous",
  discretePitchClassBased: "discretePitchClassBased",
};

const allPitchClasses = generatePitchClasses();

const sine = {
  instrument: new Tone.Oscillator().toDestination(),
  instrumentType: InstrumentFrequencyType.continuous,
  frequencyRange: {
    min: 150,
    max: 2000,
  },
};

const clarinet = {
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
  }).toDestination(),
  instrumentType: InstrumentFrequencyType.continuous,
  frequencyRange: {
    min: 150,
    max: 2000,
  },
};

const guitar = {
  instrument: new Tone.PluckSynth({
    attackNoise: 1,
    dampening: 500,
    resonance: 0.99,
  }).toDestination(),
  instrumentType: InstrumentFrequencyType.discretePitchClassBased,
  availablePitchClasses: pitchClasses("C3", "C6"),
};

function generatePitchClasses() {
  let notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  let octaves = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  var toReturn = [];
  for (let octave of octaves) {
    for (let note of notes) {
      toReturn.push(`${note}${octave}`);
    }
  }
  return toReturn;
}

function pitchClasses(from, to) {
  // debugger;
  const beginIdx = allPitchClasses.indexOf(from);
  const endIdx = allPitchClasses.indexOf(to);
  return allPitchClasses.slice(beginIdx, endIdx + 1);
}

// const guitar = new Tone.PluckSynth({
//   attackNoise: 1,
//   dampening: 600,
//   resonance: 0.98,
// }).toDestination();

export {
  clarinet,
  guitar,
  sine,
  InstrumentFrequencyType as InstrumentFrequenctType,
};

export default ({ app }, inject) => {
  inject("clarinet", clarinet);
  inject("guitar", guitar);
  inject("sine", sine);
  inject("instrumentFrequencyType", InstrumentFrequencyType);
};
