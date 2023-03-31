import * as Tone from "tone";
import _ from "lodash";

class SoundFactory {
  constructor(availableInstrumentNames) {
    //TODO: availableInstrumentNames è un array che indica quali nomi di strumenti sono ammessi tra quelli tra cui scegliere
    this.#createPanner();
  }

  #createPanner() {
    this.#panner = new Tone.Panner(0).toDestination();
  }

  #panner;

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
      instrument: new Tone.Synth().toDestination(),
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

  async enableSonifier() {
    await Tone.start();
    return true;
  }

  getInstrumentTypeFrom(instrumentId) {
    return this.getInstrumentFrom(instrumentId).instrumentType;
  }

  getInstrumentFrom(instrumentId) {
    return _.head(
      _.filter(this.#allInstruments, function (item) {
        return item.name == instrumentId;
      })
    );
  }

  pitchClasses(from, to) {
    // debugger;
    const beginIdx = this.#allPitchClasses.indexOf(from);
    const endIdx = this.#allPitchClasses.indexOf(to);
    return this.#allPitchClasses.slice(beginIdx, endIdx + 1);
  }
  stopSonification(instrumentId) {
    this.getInstrumentFrom(instrumentId).instrument.triggerRelease();
  }
  sonify(
    yValue,
    yDistanceFromFunction,
    domYIntervalExtremes,
    domYFrequencyMap,
    domXRange,
    domYRange,
    instrumentId
  ) {
    if (
      this.getInstrumentTypeFrom(instrumentId) ==
      this.InstrumentFrequencyType.continuous
    ) {
      const idxDomYValueGtCur = domYIntervalExtremes.findIndex((element) => {
        return element > yValue;
      });
      const maxValueIntervalDomY = domYIntervalExtremes[idxDomYValueGtCur];
      const minValueIntervalDomY = domYIntervalExtremes[idxDomYValueGtCur - 1];
      const maxValueIntervalFreq = domYFrequencyMap[maxValueIntervalDomY];
      const minValueIntervalFreq = domYFrequencyMap[minValueIntervalDomY];

      //equazione della retta passante per 2 punti -> x-x_1 / x_2 - x_1 = y-y_1 / y_2 - y_1
      const targetFrequency =
        (maxValueIntervalFreq - minValueIntervalFreq) *
          ((yValue - minValueIntervalDomY) /
            (maxValueIntervalDomY - minValueIntervalDomY)) +
        minValueIntervalFreq;

      setTimeout(
        function () {
          const instrument = this.getInstrumentFrom(instrumentId);
          const concreteInstrument = instrument.instrument;
          concreteInstrument.connect(this.#panner);
          // debugger;

          concreteInstrument.triggerRelease();
          console.log("freq target" + targetFrequency);
          concreteInstrument.triggerAttack(`${targetFrequency}`);
        }.bind(this),
        1
      );
    } else {
      //pitch based sonification
    }
  }
}

const soundFactory = new SoundFactory();

export default ({ app }, inject) => {
  inject("soundFactory", soundFactory);
};
