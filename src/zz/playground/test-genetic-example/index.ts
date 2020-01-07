import { AnimationLoop } from '../../../animation';
import { MathEx, TimeStep } from '../../../core';
import { UiUtils } from '../../../utils';
import { DNA } from './src/dna';

// console.clear();

const elPause = UiUtils.getInputElement("pause");
const elStepping = UiUtils.getInputElement("stepping");
const elStep = UiUtils.getInputElement("step");

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
let stepping = elStepping.checked;


let target = "to be or not to be";
const mutationRate = 0.01;
const totalPopulation = 150;
let population: DNA[] = Array.from({ length: totalPopulation }, () => new DNA(target));
let matingPool: DNA[] = [];
let generation = 0;
let done = false;
let elapsedTime: number = 0;

const fps = 60;
let frame = -1;
const loop = new AnimationLoop(update);
// const runner = new EaseRunner(loop);

!elPause.checked && loop.start();
// runner.start();

elPause.addEventListener("change", () => {
  if (elPause.checked)
    loop.stop();
  else
    loop.start();

  setStepping(false);
});

elStep.addEventListener("click", () => step());
elStepping.addEventListener("change", () => stepping = elStepping.checked);

// @ts-ignore - unused param.
function update(now: DOMHighResTimeStamp, timestep: TimeStep) {
  ++frame === (fps * pauseAfterSeconds) && pause();
  stepping && pause();

  if (elPause.checked) return;

  if (done) {
    pause();
    return;
  }

  const startTime = performance.now() * 0.001;

  // Selection.
  matingPool.splice(0);
  let totalFitness = 0;
  let bestFitness = Infinity;
  let bestDNA = population[0];

  for (let i = 0; i < population.length; i++) {
    population[i].calcFitness();
    const fitness = population[i].fitness;
    totalFitness += fitness;

    if (fitness === 1) {
      done = true;
      bestFitness = fitness;
      bestDNA = population[i];
      break;
    }

    if (fitness > bestFitness) {
      bestFitness = fitness;
      bestDNA = population[i];
    }

    const n = Math.floor(fitness * 100);

    for (let j = 0; j < n; j++) {
      matingPool.push(population[i]);
    }
  }

  // Reproduction.
  if (!done) {
    for (let i = 0; i < population.length; i++) {
      const partnerA = MathEx.random(matingPool);
      const partnerB = MathEx.random(matingPool);
      const child = partnerA.crossover(partnerB);
      child.mutate(mutationRate);
      population[i] = child;
    }
  }

  generation++;
  elapsedTime += performance.now() * 0.001 - startTime;

  elBestPhrase.textContent = bestDNA.getPhrase();
  elGenerations.textContent = generation.toLocaleString();
  !done && (elFitness.textContent = Math.round(totalFitness / totalPopulation * 100) + "%");
  elPopulation.textContent = "" + totalPopulation;
  elMutation.textContent = mutationRate * 100 + "%";
  elElapsed.textContent = `${Math.round(elapsedTime)} (${Math.round(generation / elapsedTime)} g/s)`;

  elPhrases.value = population.map(d => d.getPhrase()).join("\n");
  adjustTextAreaHeight(elPhrases);
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
