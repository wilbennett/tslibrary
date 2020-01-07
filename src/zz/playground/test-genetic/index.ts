import { AnimationLoop } from '../../../animation';
import { MathEx, TimeStep } from '../../../core';
import { BasicGeneticAlgorithm, GeneticAlgorithm } from '../../../genetic';
import { UiUtils } from '../../../utils';
import { StringDNAContext } from './string-dna-context';

// console.clear();

const elPause = UiUtils.getInputElement("pause");
const elStepping = UiUtils.getInputElement("stepping");
const elStep = UiUtils.getInputElement("step");

const elPhrase = UiUtils.getInputElement("phrase");
const elPopulationSize = UiUtils.getInputElement("population-size");
const elMutationRate = UiUtils.getInputElement("mutation-rate");
const elPhrases = UiUtils.getElement<HTMLTextAreaElement>("phrases");
const elBestPhrase = UiUtils.getElement<HTMLSpanElement>("best-phrase");
const elGenerations = UiUtils.getElement<HTMLSpanElement>("generations");
const elFitness = UiUtils.getElement<HTMLSpanElement>("fitness");
const elPopulation = UiUtils.getElement<HTMLSpanElement>("population");
const elMutation = UiUtils.getElement<HTMLSpanElement>("mutation");
const elElapsed = UiUtils.getElement<HTMLSpanElement>("elapsed");

// const colors: Brush[] = [
//   "red",
//   "orange",
//   "yellow",
//   "green",
//   "blue",
//   "indigo",
//   "violet",
//   "black",
// ];

MathEx.epsilon = 0.0001;
const pauseAfterSeconds = Infinity;//30;
let paused = elPause.checked;
let stepping = elStepping.checked;

let mutationRate = +elMutationRate.value;
let populationSize = +elPopulationSize.value;
let target: string;
let ga: GeneticAlgorithm;
let elapsedTime: number = 0;

const fps = 60;
let frame = -1;
const loop = new AnimationLoop(update);
// const runner = new EaseRunner(loop);

elPause.addEventListener("change", () => {
  if (elPause.checked)
    loop.stop();
  else {
    ga.isFinished && startAlgorithm();
    loop.start();
  }

  setStepping(false);
});

elStep.addEventListener("click", () => step());
elStepping.addEventListener("change", () => stepping = elStepping.checked);
elPhrase.addEventListener("change", startAlgorithm);
elPopulationSize.addEventListener("change", startAlgorithm);
elMutationRate.addEventListener("change", startAlgorithm);
document.addEventListener("DOMContentLoaded", () => initialize());

function initialize() {
  startAlgorithm();
  !paused && loop.start();
  // runner.start();
}

// @ts-ignore - unused param.
function update(now: DOMHighResTimeStamp, timestep: TimeStep) {
  ++frame === (fps * pauseAfterSeconds) && pause();
  stepping && pause();

  if (paused) return;

  if (ga.isFinished) {
    pause();
    return;
  }

  const startTime = performance.now() * 0.001;
  ga.processGeneration();
  elapsedTime += performance.now() * 0.001 - startTime;

  elBestPhrase.textContent = ga.bestDNA.toString();
  elGenerations.textContent = ga.generation.toLocaleString();
  !ga.isFinished && (elFitness.textContent = Math.round(ga.totalFitness / populationSize * 100) + "%");
  elPopulation.textContent = "" + populationSize;
  elMutation.textContent = (mutationRate * 100).toFixed(1) + "%";
  elElapsed.textContent = `${Math.round(elapsedTime)} (${Math.round(ga.generation / elapsedTime)} g/s)`;
  populatePhrases();
}

function populatePhrases() {
  elPhrases.value = ga.population.map(d => d.toString()).join("\n");
}

function startAlgorithm() {
  populationSize = +elPopulationSize.value;
  mutationRate = +elMutationRate.value;
  target = elPhrase.value;
  const context = new StringDNAContext(target);
  ga = new BasicGeneticAlgorithm(context, populationSize, mutationRate);
  populatePhrases();
  adjustTextAreaHeight(elPhrases);
  elapsedTime = 0;

  elPopulation.textContent = "" + populationSize;
  elMutation.textContent = (mutationRate * 100).toFixed(1) + "%";
}

function adjustTextAreaHeight(textArea: HTMLTextAreaElement) {
  const windowHeight = window.innerHeight;
  textArea.style.height = "1px";
  textArea.style.height = (Math.min(25 + textArea.scrollHeight, windowHeight - 100)) + "px";
}

function setStepping(value: boolean) {
  stepping = value;
  elStepping.checked = value;
}

function pause() {
  loop.stop();
  elPause.checked = true;
}

function step() {
  setStepping(true);

  if (loop.active) return;

  loop.start();
}
