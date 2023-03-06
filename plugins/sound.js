import * as Tone from "tone";

//---impostazioni---\\
var bpm=60;
var startFreq=110;
var endFreq=880;
var campioni=32; //<-conviene tenere potenze di 2, perchè l'orecchio umano è abituato, a livello musicale, a sentire melodie che si ripetono ogni quattro quarti..
//---fine impostazioni---\\

var started = false;
var notes = createFreqArray(startFreq,endFreq,64);
var actualStep=0;
var sampledFunction;

//crea un canale del mixer per controllare volume e panpot
const channel = new Tone.Channel(0,-1).toDestination();

//crea un synth e lo connette al canale del mixer
const synth = new Tone.Synth().connect(channel);    

//crea una chitarra e la connette al canale del mixer
const guitar = new Tone.PluckSynth({
  attackNoise: 1,
  dampening: 500,
  resonance: 0.99,
}).connect(channel);

//crea un clarinetto e lo connette al canale del mixer
const clarinet = new Tone.FMSynth({
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
}).connect(channel);

//crea un trasporto che chiama note ogni 1/campioni di battuta
Tone.Transport.scheduleRepeat((time) => {
  synth.triggerAttackRelease(notes[sampledFunction[actualStep]], campioni+"n", time);
  actualStep++;
  if (actualStep>=campioni){
    actualStep=0;
  }
  channel.pan.value+=2.0/campioni;
  if (channel.pan.value>=1){
    channel.pan.value=-1;
  }
}, campioni+"n");
Tone.Transport.bpm.value = bpm;

//crea un'array di frequenze con incremento logaritmico lunga quanto i campioni, basandosi su startFreq e endFreq
function createFreqArray(startFreq,endFreq,campioni){
  var freqArray=[];
  var freq=startFreq;
  var incremento=Math.pow(endFreq/startFreq,1/(campioni-1));
  //aggiunge 0Hertz come primo valore. così se si usa l'indice 0, vuol dire che non bisogna suonare
  freqArray.push(0);
  for (var i=0;i<campioni;i++){
    freqArray.push(Math.round(freq));
    freq*=incremento;
  }
  return freqArray;
}

//ricampiona la funzione in modo da avere valori interi compresi tra 0 e notes.length-1
function ScaleFunctionInY(sampledFunc, yMin, yMax){
  var scaledFunction=[];
  for (var i=0;i<sampledFunc.length;i++){
    if (sampledFunc[i]<yMin || sampledFunc[i]>yMax){
      scaledFunction.push(0);
    }
    else{
      var value=(sampledFunc[i]-yMin)/(yMax-yMin)*(notes.length-2);
      scaledFunction.push(Math.round(value)+1);
    }
  }
  console.log(scaledFunction)
  return scaledFunction;
}

//in ingresso vuole la funzione sotto forma di stringa
function SetFunction(func){  
  var xMin=-1.0;
  var xMax=1.0;
  var xStep=(xMax-xMin)/(campioni-1)
    
  var compile = require("interval-arithmetic-eval");
  try {
    let compiledFunc = compile(func);
    var sampledFunc=[];
    var actualX=xMin;
    for (var i=0;i<campioni;i++){
      var value = compiledFunc.eval({ x: actualX }).lo;
      sampledFunc.push(value);
      actualX+=xStep;
    }
    sampledFunction=ScaleFunctionInY(sampledFunc,-1.0,1.0);
  } catch (error) {
    console.log(error);
    return null;    
  }  
}

async function StartAudio(){
  started=true;
  await Tone.start();
  channel.pan.value=-1;   
  actualStep=0;
  Tone.Transport.start();
}

async function StopAudio(){
  Tone.Transport.stop();
  started=false;
}

function IsAudioStarted(){
  return started;
}

export default ({ app }, inject) => {
  inject("IsAudioStarted", IsAudioStarted);
  inject("SetFunction", (func) => SetFunction(func));
  inject("StopAudio", StopAudio);
  inject("StartAudio", StartAudio);
};
