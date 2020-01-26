import { AnimationLoop } from '../../../animation';
import { MathEx, TimeStep } from '../../../core';
import {
  BasicDNA,
  BasicGene,
  BasicGenePool,
  BasicGeneticAlgorithm,
  CrossoverStrategy,
  DanSelection,
  FitnessKind,
  FitnessModifierStrategy,
  FitnessStrategy,
  GeneticAlgorithm,
  MidpointCrossover,
  MonteCarloSelection,
  MutationStrategy,
  NamedStrategy,
  NullFitnessModifier,
  OrderedErrorFitness,
  OrderedMatchFitness,
  RandomProbabilitySelection,
  ReproductionStrategy,
  SelectionStrategy,
  SimpleMutation,
  SquaredFitnessModifier,
  TwoParentReproduction,
  UnorderedMatchFitness,
} from '../../../genetic';
import { UiUtils } from '../../../utils';
import { CharGene } from './char-gene';
import { StringDnaFactory } from './string-dna-factory';
import { UniqueCharGene } from './unique-char-gene';
import { UniqueStringDnaFactory } from './unique-string-dna-factory';

// console.clear();

const elPause = UiUtils.getInputElement("pause");
const elStepping = UiUtils.getInputElement("stepping");
const elStep = UiUtils.getInputElement("step");

const elPhrase = UiUtils.getInputElement("phrase");
const elPartial = UiUtils.getInputElement("partial");
const elUseFitness = UiUtils.getInputElement("use-fitness");
const elKeepBest = UiUtils.getInputElement("keep-best-dna");
const elPopulationSize = UiUtils.getInputElement("population-size");
const elMutationRate = UiUtils.getInputElement("mutation-rate");
const elFitnesses = UiUtils.getSelectElement("fitnesses");
const elFitnessModifiers = UiUtils.getSelectElement("fitness-modifiers");
const elCrossovers = UiUtils.getSelectElement("crossovers");
const elMutations = UiUtils.getSelectElement("mutations");
const elSelections = UiUtils.getSelectElement("selections");
const elReproductions = UiUtils.getSelectElement("reproductions");

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
const minCharCode = 32;
const maxCharCode = 128;
const charCodeCount = maxCharCode - minCharCode + 1;
let target: string;
let targetDNA: BasicDNA<BasicGene<String>>;
let ga: GeneticAlgorithm;
let elapsedTime: number | undefined = undefined;
let genPerSec = 0;

elPhrase.value = "abcde";
elPhrase.value = "to be or not to be";

const fitnesses: NamedStrategy[] = [
  OrderedMatchFitness,
  UnorderedMatchFitness,
  OrderedErrorFitness,
];

const fitnessModifiers: NamedStrategy[] = [
  NullFitnessModifier,
  SquaredFitnessModifier
];

const crossovers: NamedStrategy[] = [
  MidpointCrossover
];

const mutations: NamedStrategy[] = [
  SimpleMutation
];

const selections: NamedStrategy[] = [
  MonteCarloSelection,
  RandomProbabilitySelection,
  DanSelection
];

const reproductions: NamedStrategy[] = [
  TwoParentReproduction
];

const fps = 60;
const secPerFrame = 0.01;
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
elPartial.addEventListener("change", startAlgorithm);
elUseFitness.addEventListener("change", startAlgorithm);
elKeepBest.addEventListener("change", startAlgorithm);
elPopulationSize.addEventListener("change", startAlgorithm);
elMutationRate.addEventListener("change", startAlgorithm);
elFitnesses.addEventListener("change", startAlgorithm);
elFitnessModifiers.addEventListener("change", startAlgorithm);
elCrossovers.addEventListener("change", startAlgorithm);
elMutations.addEventListener("change", startAlgorithm);
elSelections.addEventListener("change", startAlgorithm);
elReproductions.addEventListener("change", startAlgorithm);
document.addEventListener("DOMContentLoaded", () => initialize());

function initialize() {
  populateStrategies();
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

  if (elapsedTime === undefined) {
    ga.processGeneration();
    elapsedTime = performance.now() * 0.001 - startTime;
    genPerSec = Math.round(ga.generation / elapsedTime);
  }

  let countPerFrame = Math.max(Math.round(genPerSec * secPerFrame * 0.5), 1);

  for (let i = 0; i < countPerFrame; i++) {
    ga.processGeneration();
  }

  elapsedTime += performance.now() * 0.001 - startTime;
  genPerSec = Math.round(ga.generation / elapsedTime);

  elBestPhrase.textContent = ga.bestDNA.toString();
  elGenerations.textContent = ga.generation.toLocaleString();
  !ga.isFinished && (elFitness.textContent = Math.round(ga.totalFitness / populationSize * 100) + "%");
  elPopulation.textContent = "" + populationSize;
  elMutation.textContent = (mutationRate * 100).toFixed(1) + "%";
  elElapsed.textContent = `${elapsedTime.toFixed(2)} s (${genPerSec} gen/s)`;
  populatePhrases();
}

function populatePhrases() {
  elPhrases.value = ga.population.map(d => d.toString()).join("\n");
}

function createStrategy<T>(element: HTMLSelectElement, list: NamedStrategy[], ...params: any[]): T {
  // @ts-ignore - Expression is not constructable.
  return <T>new list[element.selectedIndex](...params);
}

CharGene;
UniqueCharGene;

function createPartialAlgorithm() {
  const targetGenes = Array.from(target, v => new UniqueCharGene(v));
  targetDNA = new BasicDNA<UniqueCharGene>(targetGenes);

  const genes = Array.from(
    { length: charCodeCount },
    (_, i) => new UniqueCharGene(String.fromCharCode(i + minCharCode)));

  const pool = new BasicGenePool(genes);
  const dnaFactory = new UniqueStringDnaFactory();
  const geneCount = target.length + 5;
  ga = new BasicGeneticAlgorithm(dnaFactory, pool, populationSize, mutationRate, targetDNA, geneCount);
  ga.fitnessModifierStrategy = createStrategy<FitnessModifierStrategy>(elFitnessModifiers, fitnessModifiers);
  ga.crossoverStrategy = createStrategy<CrossoverStrategy<UniqueCharGene>>(elCrossovers, crossovers, dnaFactory);
  ga.mutationStrategy = createStrategy<MutationStrategy<UniqueCharGene>>(elMutations, mutations);
  ga.selectionStrategy = createStrategy<SelectionStrategy<UniqueCharGene>>(elSelections, selections);
  ga.reproductionStrategy = createStrategy<ReproductionStrategy<UniqueCharGene>>(elReproductions, reproductions);

  if (fitnesses[elFitnesses.selectedIndex] instanceof OrderedErrorFitness) {
    let maxError = 0;

    for (let i = 0; i < target.length; i++) {
      const code = target.charCodeAt(i);
      maxError += Math.max(Math.abs(code - maxCharCode), Math.abs(code - minCharCode));
    }

    ga.fitnessStrategy = new OrderedErrorFitness(maxError); // TODO: Doesn't work. Need to investigate.
  } else {
    ga.fitnessStrategy = createStrategy<FitnessStrategy<UniqueCharGene>>(elFitnesses, fitnesses);
  }
}

function createFullAlgorithm() {
  populationSize = +elPopulationSize.value;
  mutationRate = +elMutationRate.value;
  target = elPhrase.value;

  const targetGenes = Array.from(target, v => new CharGene(v));
  targetDNA = new BasicDNA<CharGene>(targetGenes);

  const genes = Array.from(
    { length: charCodeCount },
    (_, i) => new CharGene(String.fromCharCode(i + minCharCode)));

  const pool = new BasicGenePool(genes);
  const dnaFactory = new StringDnaFactory();
  ga = new BasicGeneticAlgorithm(dnaFactory, pool, populationSize, mutationRate, targetDNA);
  ga.crossoverStrategy = createStrategy<CrossoverStrategy<CharGene>>(elCrossovers, crossovers, dnaFactory);
  ga.mutationStrategy = createStrategy<MutationStrategy<CharGene>>(elMutations, mutations);
  ga.selectionStrategy = createStrategy<SelectionStrategy<CharGene>>(elSelections, selections);
  ga.reproductionStrategy = createStrategy<ReproductionStrategy<CharGene>>(elReproductions, reproductions);

  if (fitnesses[elFitnesses.selectedIndex] instanceof OrderedErrorFitness) {
    let maxError = 0;

    for (let i = 0; i < target.length; i++) {
      const code = target.charCodeAt(i);
      maxError += Math.max(Math.abs(code - maxCharCode), Math.abs(code - minCharCode));
    }

    ga.fitnessStrategy = new OrderedErrorFitness(maxError); // TODO: Doesn't work. Need to investigate.
  } else {
    ga.fitnessStrategy = createStrategy<FitnessStrategy<UniqueCharGene>>(elFitnesses, fitnesses);
  }
}

function startAlgorithm() {
  populationSize = +elPopulationSize.value;
  mutationRate = +elMutationRate.value;
  target = elPhrase.value;

  if (elPartial.checked)
    createPartialAlgorithm();
  else
    createFullAlgorithm();

  ga.keepBest = elKeepBest.checked;
  ga.fitnessKind = elUseFitness.checked ? FitnessKind.fitness : FitnessKind.error;
  ga.fitnessModifierStrategy = createStrategy<FitnessModifierStrategy>(elFitnessModifiers, fitnessModifiers);

  populatePhrases();
  adjustTextAreaHeight(elPhrases);
  elapsedTime = undefined;

  elPopulation.textContent = "" + populationSize;
  elMutation.textContent = (mutationRate * 100).toFixed(1) + "%";
}

function addOption(element: HTMLSelectElement, text: string, className = "") {
  const option = document.createElement("option");
  option.text = text;
  option.value = text;
  option.className = className;
  element.appendChild(option);
}

function populateStrategy(element: HTMLSelectElement, strategies: NamedStrategy[]) {
  while (element.options.length > 0)
    element.options.remove(0);

  // @ts-ignore - missing strategyName property.
  strategies.forEach(strategy => addOption(element, <string>strategy["strategyName"]));
}

function populateStrategies() {
  populateStrategy(elFitnesses, fitnesses);
  populateStrategy(elFitnessModifiers, fitnessModifiers);
  populateStrategy(elCrossovers, crossovers);
  populateStrategy(elMutations, mutations);
  populateStrategy(elSelections, selections);
  populateStrategy(elReproductions, reproductions);
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
