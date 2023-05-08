import * as Tone from "tone";
import _ from "lodash";

export default ({ app }, inject) => {
  class SoundFactory {
    constructor(availableInstrumentNames) {
      //TODO: availableInstrumentNames è un array che indica quali nomi di strumenti sono ammessi tra quelli tra cui scegliere
      this.#createPanner();
    }

    #createPanner() {
      this.#gain = new Tone.Gain(1).toDestination();
      this.#panner = new Tone.Panner(0);
      this.#panner.connect(this.#gain);
    }

    #panner;
    #gain;
    #audioNoYPlayer;
    #audioDomainExtremeBorder;
    #lastPitchClass;
    #minGain = 0.1;
    #maxGain = 1; //no amplificazione

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
    #getGainFrom(distance, domYRange) {
      const minRange = domYRange[0];
      const maxRange = domYRange[1];
      const m = (this.#minGain - this.#maxGain) / (maxRange - minRange);
      const q = this.#maxGain;
      return m * distance + q;
    }
    InstrumentFrequencyType = {
      continuous: "continuous",
      discretePitchClassBased: "discretePitchClassBased",
    };
    #allPitchClasses = this.#generatePitchClasses();
    #allInstruments = [
      {
        name: "sine",
        instrument: new Tone.Oscillator(), //usare Oscillator e non Synth() perchè il cambio di frequenza altrimenti avviene sentendo un "pop" ad ogni cambio. Non è dolce
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
    playSample(audioSampleId, ignoreNotFinishedYet = true) {
      switch (audioSampleId) {
        case app.$AudioSample.noYAtX:
          if (_.isNil(this.#audioNoYPlayer)) {
            this.#audioNoYPlayer = new Tone.Player().toDestination();
            this.#audioNoYPlayer.load(audioSampleId, function () {
              console.log(`audio sample loaded ${audioSampleId}`);
              this.playAudio(this.#audioNoYPlayer);
            });
          } else {
            if (ignoreNotFinishedYet) {
              this.playAudio(this.#audioNoYPlayer);
            } else {
              if (this.#audioNoYPlayer.state == "started") {
                return;
              }
              this.playAudio(this.#audioNoYPlayer);
            }
          }
          break;
        case app.$AudioSample.displayedChartBorder:
          if (_.isNil(this.#audioDomainExtremeBorder)) {
            this.#audioDomainExtremeBorder = new Tone.Player().toDestination();
            this.#audioDomainExtremeBorder.load(audioSampleId, function () {
              console.log(`audio sample loaded ${audioSampleId}`);
              this.playAudio(this.#audioDomainExtremeBorder);
            });
          } else {
            if (ignoreNotFinishedYet) {
              this.playAudio(this.#audioDomainExtremeBorder);
            } else {
              if (this.#audioDomainExtremeBorder.state == "started") {
                return;
              }
              this.playAudio(this.#audioDomainExtremeBorder);
            }
          }
          break;
      }
    }
    playAudio(player) {
      if (!player.loaded) {
        return;
      }
      if (player.state === "started") {
        player.stop();
      }
      player.start();
    }
    getAllInstrumentsName() {
      return _.map(this.#allInstruments, "name");
    }

    async enableSonifier() {
      await Tone.start();
      return true;
    }
    isToneEngineStarted() {
      return Tone.context.state === "running";
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
      console.log("stopSonification");
      const currentInstrument = this.getInstrumentFrom(instrumentId);
      // debugger;
      if (currentInstrument.name == "sine") {
        currentInstrument.instrument.stop();
      } else {
        currentInstrument.instrument.triggerRelease();
      }
      // this.getInstrumentFrom(instrumentId).instrument.triggerRelease();
    }
    sonify(
      yValue,
      xValue,
      yDistanceFromFunction, //da cui dipende il volume
      domYIntervalExtremes,
      domYFrequencyMap,
      domXRange, //da cui dipende il pan
      domYRange, //da cui dipende il volume
      instrumentId
    ) {
      const valueXRangeRatioPercentage =
        ((xValue - domXRange[0]) / (domXRange[1] - domXRange[0])) * 100;
      const curPanningValue = valueXRangeRatioPercentage / 50 - 1;
      const curGain = this.#getGainFrom(yDistanceFromFunction, domYRange);
      console.log(`current gain ${curGain}`);
      if (
        this.getInstrumentTypeFrom(instrumentId) ==
        this.InstrumentFrequencyType.continuous
      ) {
        const idxDomYValueGtCur = domYIntervalExtremes.findIndex((element) => {
          return element > yValue;
        });
        const maxValueIntervalDomY = domYIntervalExtremes[idxDomYValueGtCur];
        const minValueIntervalDomY =
          domYIntervalExtremes[idxDomYValueGtCur - 1];
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
            // debugger;
            console.log("freq target" + targetFrequency);
            const playingState =
              instrument.name == "sine"
                ? concreteInstrument.state
                : concreteInstrument.oscillator.state;
            if (playingState == "started") {
              //se ho già avviato la riproduzione
              console.log("modifico solo la frequenza ed eventualmente il pan");
              concreteInstrument.set({ frequency: `${targetFrequency}` });
              this.#panner.pan.value = curPanningValue;
              this.#gain.gain.value = curGain;
            } else {
              console.log("setup strument per primo avvio");
              concreteInstrument.connect(this.#panner); //quando fermo lo strumento mi devo preoccupare di disconnetterlo
              concreteInstrument.set({ frequency: `${targetFrequency}` });
              this.#panner.pan.value = curPanningValue;
              this.#gain.gain.value = curGain;
              instrument.name == "sine"
                ? concreteInstrument.start()
                : concreteInstrument.triggerAttack(`${targetFrequency}`);
            }
            // concreteInstrument.triggerRelease();
          }.bind(this),
          1
        );
      } else {
        const idxDomYValueLtCur =
          domYIntervalExtremes.findIndex((element) => {
            return element > yValue;
          }) - 1;
        const pitchClass =
          domYFrequencyMap[domYIntervalExtremes[idxDomYValueLtCur]];
        if (pitchClass == this.#lastPitchClass) {
          return;
        }
        this.#lastPitchClass = pitchClass;
        setTimeout(
          function () {
            const instrument = this.getInstrumentFrom(instrumentId);
            const concreteInstrument = instrument.instrument;
            console.log(`pitch class ${pitchClass}`);
            if (concreteInstrument.state == "started") {
              concreteInstrument.triggerRelease();
            } else {
              concreteInstrument.connect(this.#panner);
            }
            this.#panner.pan.value = curPanningValue;
            this.#gain.gain.value = curGain;
            concreteInstrument.triggerAttackRelease(pitchClass, "4n");
          }.bind(this),
          1
        );
      }
    }
  }

  const soundFactory = new SoundFactory();

  inject("soundFactory", soundFactory);
};
