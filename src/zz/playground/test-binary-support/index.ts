import { AnimationLoop } from '../../../animation';
import { WebColors } from '../../../colors';
import { MathEx, Tristate } from '../../../core';
import { Ease, EaseRunner, NumberEaser } from '../../../easing';
import { Brush, CanvasContext, ContextProps, Graph, Viewport } from '../../../twod';
import { PolygonShape, SupportPoint, SupportPointImpl } from '../../../twod/shapes';
import { UiUtils } from '../../../utils';
import { dir, pos, Vector } from '../../../vectors';

const { ONE_DEGREE } = MathEx;

// console.clear();

// const ZERO_DIRECTION = dir(0, 0);

const gridExtent = 600;
const canvasb = UiUtils.getCanvasElement("canvasb");
canvasb.width = gridExtent;
canvasb.height = gridExtent;
const ctxb = new CanvasContext(canvasb);

const canvas = UiUtils.getCanvasElement("canvas");
canvas.width = gridExtent;
canvas.height = gridExtent;
const ctx = new CanvasContext(canvas);

const elPause = UiUtils.getInputElement("pause");
const elStep = UiUtils.getInputElement("step");
const elChangeShapes = UiUtils.getInputElement("changeshapes");
const elPrev = UiUtils.getInputElement("prev");
const elNext = UiUtils.getInputElement("next");
const elPrevPair = UiUtils.getInputElement("prevpair");
const elNextPair = UiUtils.getInputElement("nextpair");

ctx.fillStyle = WebColors.whitesmoke;
ctx.fillRect(ctx.bounds);

const colors: Brush[] = [
  "red",
  "orange",
  "yellow",
  "green",
  "blue",
  "indigo",
  "violet",
];

MathEx.epsilon = 0.0001;
Vector.tipDrawHeight = 1.0;
const screenBounds = ctx.bounds;
const origin = pos(0, 0);
const gridSize = 20;
let angle = 0;
// const duration = 5;
const pauseAfterSeconds = Infinity;
let isDirty = true;
let autoChangeShapes = true;

const graph = new Graph(ctx.bounds, gridSize);
let poly = new PolygonShape(20, 10, 0 * ONE_DEGREE, false);
poly.props = { strokeStyle: "blue", lineWidth: 2 };
const direction = dir(5, 0);
const dirProps: ContextProps = { strokeStyle: "red", fillStyle: WebColors.darkred, lineWidth: 2 };
const supVProps: ContextProps = { strokeStyle: "gray", fillStyle: WebColors.lightgrey, lineWidth: 2 };
const closeVProps: ContextProps = { strokeStyle: "black", fillStyle: "black", lineWidth: 5, lineDash: [1, 1] };
const badVProps: ContextProps = { strokeStyle: "red", fillStyle: WebColors.orangered, lineWidth: 8 };
const nextProps: ContextProps = { strokeStyle: "green", fillStyle: "green", lineWidth: 10, lineDash: [1, 1], globalAlpha: 0.5 };
const prevProps: ContextProps = { strokeStyle: "red", fillStyle: "red", lineWidth: 10, lineDash: [1, 1], globalAlpha: 0.5 };

const supportChangeVectors: [Vector, SupportPoint][] = [];
const badValue = new SupportPointImpl(poly, undefined, pos(8, 8));
badValue.worldDirection = dir(5, 5);
let badRadius = 0;

const fps = 60;
const secPerFrame = 1 / fps;
const framesPerDegree = 1;
const secPerDegree = framesPerDegree * secPerFrame;
const degrees = 360;
const dirAnimDuration = secPerDegree * degrees;

const dirAnim = new NumberEaser(0, degrees, dirAnimDuration, Ease.linear, v => {
  direction.withDegreesMag(v, direction.mag);
  support1 = poly.getSupport(direction);
  const cl = findClosestSupport(direction);
  closestVector = cl.worldDirection;
  support2 = cl;
  isDirty = true;
}).onCompleted(() => autoChangeShapes && changeShape());

let frame = -1;
const loop = new AnimationLoop(undefined, render);
const runner = new EaseRunner(loop);

runner.add(dirAnim.repeat(Infinity));

drawGraph();
changeShape();
loop.start();
runner.start();

let stepping = false;
let support1: Tristate<SupportPoint> = null;
let support2: Tristate<SupportPoint> = null;
let closestVector = pos(0, 0);
let nextVector = pos(0, 0);
let prevVector = pos(0, 0);

/*
direction.withXY(4.10, 2.87);
// direction.withDegreesMag(v.degrees - 0.005, direction.mag);
support1 = poly.getSupport(direction);
const cl = findClosestSupport(direction);
closestVector = cl.worldDirection;
support2 = cl;
// const cross = v.cross2D(direction);
// console.log(`${cross}`);
//*/


elPause.addEventListener("change", () => {
  if (elPause.checked)
    loop.stop();
  else
    loop.start();

  stepping = false;
  elStep.checked = false;
});

elChangeShapes.addEventListener("change", () => {
  autoChangeShapes = elChangeShapes.checked;

  if (autoChangeShapes)
    changeShape();
});

elPrev.addEventListener("click", () => {
  isDirty = true;
  stepping = true;
  elStep.checked = true;

  if (!loop.active)
    loop.start();
});

elNext.addEventListener("click", () => {
  isDirty = true;
  stepping = true;
  elStep.checked = true;

  if (!loop.active)
    loop.start();
});

elPrevPair.addEventListener("click", () => {
  isDirty = true;

  if (!loop.active)
    render();
});

elNextPair.addEventListener("click", () => {
  isDirty = true;

  if (!loop.active)
    render();
});

elStep.addEventListener("change", () => stepping = elStep.checked);

function drawGraph() {
  ctxb.beginPath().withFillStyle("grey").fillRect(ctxb.bounds);

  ctxb
    .save()
    .translate(screenBounds.center)
    .rotateDegrees(angle)
    .translate(screenBounds.center.negateO());

  graph.render(ctxb);
  ctxb.restore();
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

function render() {
  if (++frame === (60 * pauseAfterSeconds)) {
    loop.stop();
    elPause.checked = true;
  }

  if (stepping) {
    loop.stop();
    elPause.checked = true;
  }

  // if (!isDirty) return;

  ctx.beginPath().clearRect(ctx.bounds);
  applyTransform();

  const view = graph.getViewport(ctx);
  view.applyTransform();

  supportChangeVectors.forEach((v, i) => {
    supVProps.strokeStyle = colors[i % colors.length];
    supVProps.fillStyle = colors[i % colors.length];
    v[0].scaleO(15).render(view, origin, supVProps);
  });

  poly.render(view);
  direction.render(view, origin, dirProps);
  support1 && drawSupport1(support1, view);
  support2 && drawSupport2(support2, view);
  closestVector.scaleO(15).render(view, origin, support2 === badValue ? badVProps : closeVProps);
  nextVector.scaleO(15).render(view, origin, nextProps);
  prevVector.scaleO(15).render(view, origin, prevProps);

  // if (support1 && support2 && !support1.worldPoint.equals(support2.worldPoint)) {
  if (support1 && support2) {
    const next = (support1.index + 1) % poly.vertexList.length;
    const prev = support1.index > 0 ? support1.index - 1 : poly.vertexList.length - 1;

    if (support2.index !== support1.index && support2.index !== next && support2.index !== prev) {
      elPause.checked = true;
      loop.stop();
      addBadAnim();
      console.log(`${direction}, ${support1.index}, ${support2.index}`);
    }
  }

  beginPath({ fillStyle: "red" }, view).fillCircle(pos(0, 0), badRadius);

  view.restoreTransform();
  restoreTransform();
  isDirty = false;

  if (support2 === badValue) {
    elPause.checked = true;
    loop.stop();
  }
}

function addBadAnim() {
  const anim = new NumberEaser(4, 0, 0.5, Ease.outQuad, v => badRadius = v);
  runner.add(anim);
}

function zone(a: Vector) {
  return a.y >= 0 && a.x >= 0
    ? 1
    : a.y > 0 ? 1 : 2;
}

function quad(a: Vector) {
  if (a.x >= 0)
    return a.y >= 0 ? 1 : 4;

  return a.y >= 0 ? 2 : 3;
}

function compareVectorAngle(a: Vector, b: Vector) {
  // const za = a.y >= 0 ? a.x >= 0 ? 1 : 2 : 2;
  // const zb = b.y >= 0 ? b.x >= 0 ? 1 : 2 : 2;
  // const za = zone(a);
  // const zb = zone(b);
  const za = quad(a);
  const zb = quad(b);

  return za !== zb ? za - zb : b.cross2D(a);
}

function findClosestSupport(target: Vector) {
  const count = supportChangeVectors.length;
  let left = 0;
  let right = count;

  while (left < right) {
    const middle = Math.floor((left + right) * 0.5);

    if (compareVectorAngle(supportChangeVectors[middle][0], target) > 0)
      right = middle;
    else
      left = middle + 1;
  }

  const index = left > 0 ? left - 1 : count - 1;
  let entry = supportChangeVectors[index][1];

  //*
  return entry;
  /*/
  const nextIndex = index < count - 1 ? index + 1 : 0;
  const prevIndex = index > 0 ? index - 1 : count - 1;
  const nextEntry = supportChangeVectors[nextIndex][1];
  const prevEntry = supportChangeVectors[prevIndex][1];
  nextVector = supportChangeVectors[nextIndex][0];
  prevVector = supportChangeVectors[prevIndex][0];
  const dot = entry.worldPoint.dot(target);
  const dotNext = nextEntry.worldPoint.dot(target);
  const dotPrev = prevEntry.worldPoint.dot(target);
  // console.log(`${dotPrev}, ${dot}, ${dotNext}`);

  if (dotNext > dot) return dotNext > dotPrev ? nextEntry : prevEntry;
  return dotPrev >= dot ? prevEntry : entry;
  //*/
}

function createSupportChangeVectors() {
  supportChangeVectors.splice(0);
  const vec = dir(1, 0);
  const sup = poly.getSupport(vec);
  let prev = sup.worldPoint.clone();

  if (!sup) return;

  // supportChangeVectors.push([vec.clone(), sup.clone()]);

  for (let a = 0; a < 360; a++) {
    vec.rotateOneDegree();
    poly.getSupport(vec, sup);

    if (sup.worldPoint.equals(prev)) continue;

    prev = sup.worldPoint.clone();
    supportChangeVectors.push([vec.clone(), sup.clone()]);
  }
}

function changeShape() {
  //*
  const vertexCount = MathEx.randomInt(5, 20);
  const startAngle = MathEx.randomInt(0, 360) * ONE_DEGREE;
  const isRegular = Math.random() > 0.5;
  /*/
  const vertexCount = 19;
  const startAngle = 40 * ONE_DEGREE;
  const isRegular = false;
  //*/
  // console.clear();
  // console.log(`${vertexCount}, ${startAngle * 180 / Math.PI}, ${isRegular}`);
  poly = new PolygonShape(vertexCount, 10, startAngle, isRegular);
  poly.props = { strokeStyle: "blue", lineWidth: 2 };

  createSupportChangeVectors();
}

function drawSupport1(support: SupportPoint, view: Viewport) {
  const props: ContextProps = { strokeStyle: WebColors.blueviolet, fillStyle: WebColors.blueviolet, lineWidth: 2, lineDash: [] };

  beginPath(props, view).fillCircle(support.worldPoint, 0.4);
}

function drawSupport2(support: SupportPoint, view: Viewport) {
  const props: ContextProps = { strokeStyle: WebColors.green, fillStyle: WebColors.green, lineWidth: 2, lineDash: [] };

  beginPath(props, view).strokeCircle(support.worldPoint, 0.7);
}

function getLineWidth(props: ContextProps, viewport: Viewport) {
  return viewport.calcLineWidth(props.lineWidth !== undefined ? props.lineWidth : 1);
}

function beginPath(props: ContextProps, view: Viewport) {
  view.ctx.beginPath().withGlobalAlpha(1).withProps(props).withLineWidth(getLineWidth(props, view));
  return view.ctx;
}
