import { AnimationLoop } from '../../../animation';
import { MathEx, TimeStep } from '../../../core';
import {
  DanSelection,
  GeneticAlgorithm,
  MidpointCrossover,
  MonteCarloSelection,
  NamedStrategy,
  RandomProbabilitySelection,
  SimpleMutation,
  TwoParentReproduction,
} from '../../../genetic';
import { Bounds } from '../../../misc';
import { CanvasContext, ContextProps, Graph, Viewport } from '../../../twod';
import { UiUtils } from '../../../utils';
import { dir, pos, Vector } from '../../../vectors';
import { BarInfo } from './src';

// console.clear();

const elToolbar = UiUtils.getDivElement("toolbar");
const cwrapper = UiUtils.getDivElement("canvaswrapper");
const elScroll = UiUtils.getInputElement("scroll");
// let gridExtent = Math.min(cwrapper.clientWidth, cwrapper.clientHeight);
// gridExtent * 0.5;
const canvasb = UiUtils.getCanvasElement("canvasb");
const ctxb = new CanvasContext(canvasb);

const canvas = UiUtils.getCanvasElement("canvas");
const ctx = new CanvasContext(canvas);

const elPause = UiUtils.getInputElement("pause");
const elStepping = UiUtils.getInputElement("stepping");
const elStep = UiUtils.getInputElement("step");

const elPopulationSize = UiUtils.getInputElement("population-size");
const elMutationRate = UiUtils.getInputElement("mutation-rate");
const elCrossovers = UiUtils.getSelectElement("crossovers");
const elMutations = UiUtils.getSelectElement("mutations");
const elSelections = UiUtils.getSelectElement("selections");
const elReproductions = UiUtils.getSelectElement("reproductions");

// const elStats = UiUtils.getElement<HTMLTextAreaElement>("stats");

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
MathEx.epsilon = 0.0001;
Vector.tipDrawHeight = 1.0;
const screenBounds = ctx.bounds;
let angle = 0;
const pauseAfterSeconds = Infinity;//30;
let paused = elPause.checked;
let stepping = elStepping.checked;

let bars: BarInfo[] = [];
// let mutationRate = +elMutationRate.value;
// let populationSize = +elPopulationSize.value;
// let target: string;
let ga: GeneticAlgorithm;
// let elapsedTime: number = 0;

let graph: Graph;
const cellSize = dir(15, 15);
const cellSizeInv = dir(1 / cellSize.x, 1 / cellSize.y);
let activeCellSize = cellSize;
let activeCellSizeInv = dir(1 / activeCellSize.x, 1 / activeCellSize.y);
const barMargin = 2.0;
const verticalMargin = 1;
let barWidth: number;
let halfBarWidth: number;
// let tickHeight: number;
let barsInView: number;
let ticksInView: number;
const tickScale = 4;
let lowestBarValue = Infinity;
let highestBarValue = -Infinity;
let startBarIndex = 0;
let minY = 0;
let maxY = 0;
let midY = 0;
let isGraphDirty = true;
let isGraphRecenterNeeded = true;
let isBarsDirty = false;

fetch("bardata.csv")
  .then(res => {
    if (res.status !== 200) {
      console.log(`Error loading bar data: ${res.statusText}`);
    }

    res.text().then(txt => {
      parseData(txt);
      calculateEntries();
      recreateGraph();
      elScroll.min = "0";
      elScroll.max = "" + Math.max(bars.length - barsInView, 0);
      elScroll.valueAsNumber = 0;
    });
  });

const normalProps: ContextProps = { strokeStyle: "white", lineWidth: 1 };
const upEntryProps: ContextProps = { strokeStyle: "yellow", lineWidth: 2 };
const upProps: ContextProps = { fillStyle: "green" };
const downProps: ContextProps = { fillStyle: "red" };
const haUpProps: ContextProps = { fillStyle: "green" };
const haDownProps: ContextProps = { fillStyle: "red" };

const crossovers: NamedStrategy[] = [
  MidpointCrossover
];

const mutations: NamedStrategy[] = [
  SimpleMutation
];

const selections: NamedStrategy[] = [
  DanSelection,
  MonteCarloSelection,
  RandomProbabilitySelection
];

const reproductions: NamedStrategy[] = [
  TwoParentReproduction
];

const fps = 60;
let frame = -1;
const loop = new AnimationLoop(update, render);
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
elPopulationSize.addEventListener("change", startAlgorithm);
elMutationRate.addEventListener("change", startAlgorithm);
elCrossovers.addEventListener("change", startAlgorithm);
elMutations.addEventListener("change", startAlgorithm);
elSelections.addEventListener("change", startAlgorithm);
elReproductions.addEventListener("change", startAlgorithm);
elScroll.addEventListener("change", () => setBarStartIndex(elScroll.valueAsNumber));
canvas.addEventListener("wheel", ev => setBarStartIndex(startBarIndex + ev.deltaY * -0.01));
document.addEventListener("DOMContentLoaded", () => initialize());

window.addEventListener("resize", () => recreateGraph());

function setBarStartIndex(value: number) {
  value = Math.round(value);
  startBarIndex = Math.max(Math.min(value, bars.length - barsInView), 0);
  elScroll.valueAsNumber = startBarIndex;
  dirtyGraphCenter();
}

function initialize() {
  populateStrategies();
  recreateGraph();
  // startAlgorithm();
  !paused && loop.start();
  // runner.start();
}

// @ts-ignore - unused param.
function update(now: DOMHighResTimeStamp, timestep: TimeStep) {
  ++frame === (fps * pauseAfterSeconds) && pause();
  stepping && pause();

  if (paused) return;

  /*
  if (ga.isFinished) {
    pause();
    return;
  }

  const startTime = performance.now() * 0.001;
  ga.processGeneration();
  elapsedTime += performance.now() * 0.001 - startTime;
  //*/
  populateStats();
}

// @ts-ignore - unused param.
function render(now: DOMHighResTimeStamp, timestep: TimeStep) {
  ++frame === (fps * pauseAfterSeconds) && pause();
  stepping && pause();

  isBarsDirty && ctx.beginPath().clearRect(ctx.bounds);
  applyTransform();

  isGraphRecenterNeeded && centerGraphForStartBar(startBarIndex);
  isGraphDirty && drawGraph();

  if (isBarsDirty) {
    const view = graph.getViewport(ctx);
    view.applyTransform();

    drawBars(startBarIndex, view);
    // beginPath({ fillStyle: "magenta" }, view, true).fillRect(0, 0, 1, maxY);
    // beginPath({ fillStyle: "blue" }, view, true).fillRect(0, 0, 1, midY);
    // beginPath({ fillStyle: "orange" }, view, true).fillRect(0, 0, 1, minY);

    view.restoreTransform();
  }

  restoreTransform();
}

function drawGraph() {
  ctxb.beginPath().clearRect(ctxb.bounds);

  ctxb
    .save()
    .translate(screenBounds.center)
    .rotateDegrees(angle)
    .translate(screenBounds.center.negateO());

  graph.render(ctxb);
  ctxb.restore();
  cleanGraph();
}

function applyTransform() {
  ctx
    .save()
    .translate(screenBounds.center)
    .rotateDegrees(angle)
    .translate(screenBounds.center.negateO());
}

function restoreTransform() {
  ctx.restore();
}

function populateStats() {
  // elBestPhrase.textContent = ga.bestDNA.toString();
  // elGenerations.textContent = ga.generation.toLocaleString();
  // !ga.isFinished && (elFitness.textContent = Math.round(ga.totalFitness / populationSize * 100) + "%");
  // elPopulation.textContent = "" + populationSize;
  // elMutation.textContent = (mutationRate * 100).toFixed(1) + "%";
  // elElapsed.textContent = `${Math.round(elapsedTime)} (${Math.round(ga.generation / elapsedTime)} gen/s)`;
  // populatePhrases();
  // elStats.value = ga.population.map(d => d.toString()).join("\n");
}

/*
function createStrategy<T>(element: HTMLSelectElement, list: NamedStrategy[], context: StringDNAContext): T {
  // @ts-ignore - Expression is not constructable.
  return <T>new list[element.selectedIndex](context);
}
//*/

function startAlgorithm() {
  // populationSize = +elPopulationSize.value;
  // mutationRate = +elMutationRate.value;
  // target = elPhrase.value;
  // const context = new StringDNAContext(target);
  // ga = new BasicGeneticAlgorithm(context, populationSize, mutationRate);
  // context.crossoverStrategy = createStrategy<CrossoverStrategy<StringGene>>(elCrossovers, crossovers, context);
  // context.mutationStrategy = createStrategy<MutationStrategy<StringGene>>(elMutations, mutations, context);
  // ga.selectionStrategy = createStrategy<SelectionStrategy<StringGene>>(elSelections, selections, context);
  // ga.reproductionStrategy = createStrategy<ReproductionStrategy<StringGene>>(elReproductions, reproductions, context);
  // populatePhrases();
  // adjustTextAreaHeight(elPhrases);
  // elapsedTime = 0;
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

  strategies.forEach(strategy => addOption(element, strategy.name));
}

function populateStrategies() {
  populateStrategy(elCrossovers, crossovers);
  populateStrategy(elMutations, mutations);
  populateStrategy(elSelections, selections);
  populateStrategy(elReproductions, reproductions);
}

/*
function adjustTextAreaHeight(textArea: HTMLTextAreaElement) {
  const windowHeight = window.innerHeight;
  textArea.style.height = "1px";
  textArea.style.height = (Math.min(25 + textArea.scrollHeight, windowHeight - 100)) + "px";
}
//*/

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

function getLineWidth(props: ContextProps, viewport: Viewport, scaleWidth: boolean = false) {
  let lineWidth = props.lineWidth ?? 1;
  lineWidth = viewport.calcLineWidth(lineWidth);
  !scaleWidth && (lineWidth *= activeCellSize.maxElement);
  return lineWidth;
}

function beginPath(props: ContextProps, view: Viewport, scaleWidth: boolean = false) {
  view.ctx.beginPath().withGlobalAlpha(1).withProps(props).withLineWidth(getLineWidth(props, view, scaleWidth));
  return view.ctx;
}

function updateCanvasSizes() {
  canvasb.width = 1;
  canvas.width = 1;

  // const gridExtentX = Math.min(cwrapper.clientWidth, cwrapper.clientHeight);
  const gridExtentX = cwrapper.clientWidth;
  // const gridExtentY = cwrapper.clientHeight;
  canvasb.width = gridExtentX;
  canvasb.height = window.innerHeight - elToolbar.clientHeight - elScroll.clientHeight - 40;// gridExtentY;

  const rect = canvasb.getBoundingClientRect();
  canvas.style.left = rect.left + "px";
  canvas.style.top = rect.top + "px";
  canvas.width = canvasb.width;
  canvas.height = canvasb.height;

  elScroll.style.width = canvasb.width - 5 + "px";
}

function updateCellVariables(graph: Graph) {
  barsInView = Math.floor(graph.bounds.width / activeCellSize.x);
  ticksInView = Math.floor(graph.bounds.height / activeCellSize.y);
  barWidth = activeCellSize.x - barMargin * 2;
  halfBarWidth = barWidth * 0.5;
  // tickHeight = activeCellSize.y;
}

function createGraph(): Graph {
  updateCanvasSizes();
  let ctxBounds = ctx.bounds;
  let worldBounds: Bounds;

  if (bars.length === 0) {
    worldBounds = ctxBounds.clone();
  } else {
    let [, highest] = getBarRange(0, bars.length);
    let width = Math.max(bars.length, ctxBounds.width / activeCellSize.x);
    let height = Math.max(highest * tickScale, ctxBounds.height / activeCellSize.y);
    // Double size to allow centering.
    height *= 2;
    // Viewport expects world centered at (0, 0) so make 4 quadrants (Bars are in upper right quadrant).
    width *= 2;
    height *= 2;
    worldBounds = Bounds.fromCenter(0, 0, width, height);
  }

  let graph = new Graph(ctxBounds.clone(), activeCellSize.x, worldBounds);
  graph.gridSize = activeCellSize;
  graph.background = "black";
  graph.lineBrush = "rgba(210, 210, 210)";

  updateCellVariables(graph);
  return graph;
}

function dirtyBars() { isBarsDirty = true; }
function cleanBars() { isBarsDirty = false; }

function dirtyGraph() {
  isGraphDirty = true;
  dirtyBars();
}

function cleanGraph() { isGraphDirty = false; }

function dirtyGraphCenter() {
  isGraphRecenterNeeded = true;
  dirtyBars();
  dirtyGraph();
}

function cleanGraphCenter() { isGraphRecenterNeeded = false; }

function recreateGraph() {
  graph = createGraph();
  dirtyGraph();
  dirtyGraphCenter();
}

function getBarRange(startIndex: number, count: number): [number, number] {
  if (bars.length === 0 || startIndex < 0 || startIndex >= bars.length) return [0, 0];

  const end = startIndex + Math.min(count, bars.length - startIndex - 1);
  let lowest = Infinity;
  let highest = -Infinity;

  for (let i = startIndex; i < end; i++) {
    const bar = bars[i];
    bar.low < lowest && (lowest = bar.low);
    bar.high > highest && (highest = bar.high);
  }

  return [lowest, highest];
}

function getBarX(index: number) { return index * activeCellSize.x; }

function getBarY(value: number) { return value * activeCellSize.y * tickScale; }

function calcMinMaxY(index: number) {
  [minY, maxY] = getBarRange(index, barsInView);
  minY *= tickScale;
  maxY *= tickScale;
}

function centerGraphForStartBar(index: number) {
  if (bars.length === 0 || index < 0 || index >= bars.length) return;

  const origSizeY = activeCellSize.y;
  activeCellSize = cellSize;
  activeCellSizeInv = cellSizeInv;
  updateCellVariables(graph);
  calcMinMaxY(index);
  const ticksInRange = maxY - minY + verticalMargin * 2;

  if (ticksInRange > ticksInView) {
    activeCellSize = dir(cellSize.x, Math.floor(ctx.bounds.height / ticksInRange));
    activeCellSizeInv = dir(1 / activeCellSize.x, 1 / activeCellSize.y);
    updateCellVariables(graph);
    calcMinMaxY(index);
  }

  if (activeCellSize.y !== origSizeY) {
    graph.gridSize = activeCellSize;
    dirtyGraph();
  }

  midY = (minY + maxY) * 0.5;

  const centerX = index + barsInView * 0.5;
  const centerY = midY;
  graph.viewCenter = pos(centerX, centerY);
  // graph.viewCenter = pos(5, 5);
  cleanGraphCenter();
}

function drawRect(props: ContextProps, view: Viewport, x: number, y: number, width: number, height: number) {
  const ctx = beginPath(props, view).rect(x, y, width, height);
  props.fillStyle && ctx.fill();
  props.strokeStyle && ctx.stroke();
}

/*
function drawCircle(props: ContextProps, view: Viewport, x: number, y: number, radius: number) {
  const ctx = beginPath(props, view).circle(x, y, radius);
  props.fillStyle && ctx.fill();
  props.strokeStyle && ctx.stroke();
}
//*/

function drawBar(index: number, x: number, view: Viewport) {
  const bar = bars[index];
  let open = getBarY(bar.open);
  let high = getBarY(bar.high);
  let low = getBarY(bar.low);
  let close = getBarY(bar.close);
  let sum = open + close;
  let bodyMin = Math.min(open, close);
  let bodyMax = sum - bodyMin;
  let height = bodyMax - bodyMin;
  const width = barWidth;
  x += barMargin;

  let props = bar.isUp ? upProps : downProps;
  drawRect(props, view, x, bodyMin, width, height); // Body.

  props = bar.isHaUp ? haUpProps : haDownProps;
  height *= 0.5;
  drawRect(props, view, x, bodyMin, width, height); // Heiken indicator.

  props = !!bar.isUpEntry ? upEntryProps : normalProps;
  height = bodyMax - bodyMin;
  drawRect(props, view, x, bodyMin, width, height); // Outline.

  x += halfBarWidth;
  low < bodyMin && view.ctx.beginPath().line(x, low, x, bodyMin).stroke(); // Lower wick.
  high > bodyMax && view.ctx.beginPath().line(x, high, x, bodyMax).stroke(); // Upper wick.
}

function drawBars(startIndex: number, view: Viewport) {
  if (bars.length === 0 || startIndex < 0 || startIndex >= bars.length) return;

  view.ctx.scale(activeCellSizeInv);
  const end = startIndex + Math.min(barsInView, bars.length - startIndex);
  let x = getBarX(startIndex);

  for (let i = startIndex; i < end; i++) {
    drawBar(i, x, view);
    x += activeCellSize.x;
  }

  view.ctx.scale(activeCellSize);
  cleanBars();
}

function hasHighValue(target: number, lowCuttoff: number, startIndex: number) {
  const count = bars.length;

  for (let i = startIndex; i < count; i++) {
    const bar = bars[i];

    if (bar.low <= lowCuttoff) return false;
    if (bar.high >= target) return true;
  }

  return false;
}

function calculateEntries() {
  let count = bars.length;

  for (let i = count - 2; i >= 0; i--) {
    const bar = bars[i];
    const nextBar = bars[i + 1];
    bar.isNextOpenHigher = nextBar.open > bar.high;
  }

  count--;

  for (let i = 0; i < count; i++) {
    const bar = bars[i];

    if (bar.isHaUp) continue;
    if (!bar.isNextOpenHigher) continue;

    bar.isUpEntry = hasHighValue(bar.high + 0.25 + 2, bar.low, i + 1);
  }
}

function parseData(txt: string) {
  bars.splice(0);
  lowestBarValue = Infinity;
  highestBarValue = -Infinity;
  startBarIndex = 0;
  const lines = txt.split(/\r?\n/);

  lines.forEach(line => {
    const parts = line.split(",");
    const date = Date.parse(parts[0]);
    const open = +parts[1];
    const high = +parts[2];
    const low = +parts[3];
    const close = +parts[4];
    const isUp = parts[5] === "U";
    const isHaUp = parts[6] === "HU";

    low < lowestBarValue && (lowestBarValue = low);
    high > highestBarValue && (highestBarValue = high);

    bars.push({ date, open, high, low, close, isUp, isHaUp });
  });

  /*
  bars.splice(0);
  bars.push({ date: 0, open: 0.25, high: 1.25, low: 0.25, close: 1.25, isUp: true, isHaUp: true });
  bars.push({ date: 0, open: 1.50, high: 2.50, low: 1.50, close: 2.50, isUp: true, isHaUp: true });
  bars.push({ date: 0, open: 1.25, high: 1.75, low: 0.75, close: 1.75, isUp: true, isHaUp: true });
  bars.push({ date: 0, open: 2.00, high: 2.50, low: 1.50, close: 1.50, isUp: false, isHaUp: true });
  //*/

  dirtyGraph();
  dirtyGraphCenter();
}
