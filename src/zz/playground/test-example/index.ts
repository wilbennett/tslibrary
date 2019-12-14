import { AnimationLoop } from '../../../animation';
import { WebColors } from '../../../colors';
import { Material, MathEx } from '../../../core';
import { CanvasContext, Graph } from '../../../twod';
import { CircleShape, PolygonShape } from '../../../twod/shapes';
import { UiUtils } from '../../../utils';
import { pos, Vector } from '../../../vectors';
import { Scene } from './src';

//! BUG: Circles sometimes spin out of control.
//! BUG: Larger objects falling on smaller objects cause explosion.

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
const elStepping = UiUtils.getInputElement("stepping");
const elStep = UiUtils.getInputElement("step");
const elClear = UiUtils.getInputElement("clear");

ctx.fillStyle = WebColors.whitesmoke;
ctx.fillRect(ctx.bounds);

MathEx.epsilon = 0.0001;
Vector.tipDrawHeight = 1.0;
const screenBounds = ctx.bounds;
const gridSize = 8;
let angle = 0;
const pauseAfterSeconds = Infinity;//30;

const graph = new Graph(ctx.bounds, gridSize);
graph.viewCenter = pos(35, -35);
graph.background = "black";
graph.lineBrush = "rgba(70, 70, 70)";
const scene = new Scene(1 / 60, 10);

let frame = -1;
const loop = new AnimationLoop(update, render);

drawGraph();
resetScene();
loop.start();

let stepping = false;
const mouse = pos(0, 0);

elPause.addEventListener("change", () => {
  if (elPause.checked)
    loop.stop();
  else
    loop.start();

  stepping = false;
  elStepping.checked = false;
});

elStep.addEventListener("click", () => {
  stepping = true;
  elStepping.checked = true;

  if (!loop.active)
    loop.start();
});

elStepping.addEventListener("change", () => stepping = elStepping.checked);
elClear.addEventListener("click", () => resetScene());
canvas.addEventListener("mousedown", handleMouseDown);
canvas.addEventListener("contextmenu", ev => ev.preventDefault());

function drawGraph() {
  ctxb.beginPath().clearRect(ctxb.bounds);

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

function update() {
  scene.step();
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

  ctx.beginPath().clearRect(ctx.bounds);
  applyTransform();

  const view = graph.getViewport(ctx);
  view.applyTransform();
  ctx.scale(1, -1);

  scene.render(view);

  view.restoreTransform();
  restoreTransform();
}

function updateMouse(ev: MouseEvent) {
  const view = graph.getViewport(ctx);
  const rect = canvas.getBoundingClientRect();
  mouse.withXY(ev.clientX - rect.left, ev.clientY - rect.top);
  view.toWorld(mouse, true, mouse);
  mouse.withNegY();
}

function handleMouseDown(ev: MouseEvent) {
  updateMouse(ev);

  let mat: Material = {
    name: "temp",
    density: 1,
    //  restitution: 1,
    restitution: 0.6,
    kineticFriction: 0.2,
    staticFriction: 0.3,
  };

  switch (ev.button) {
    case 0:
      /*
      const hw = 2;
      const hh = 2;
      const vertices = [
        pos(-hw, -hh),
        pos(hw, -hh),
        pos(hw, hh),
        pos(-hw, hh),
      ];
      /*/
      const count = MathEx.randomInt(3, 10);
      // const vertices = new Array<Vector>(count);
      const e = MathEx.random(5, 10);

      // for (let i = 0; i < count; i++) {
      //   vertices[i] = pos(MathEx.random(-e, e), MathEx.random(-e, e));
      // }

      const poly = new PolygonShape(count, e, 0, false, mat);
      //*/

      const b = scene.add(poly, mouse.x, mouse.y);
      b.setOrient(MathEx.random(-Math.PI, Math.PI));
      b.setOrient(0 * Math.PI / 180);
      render();
      break;
    case 1:
      break;
    case 2:
      const c = new CircleShape(MathEx.random(1, 3), mat);
      scene.add(c, mouse.x, mouse.y);
      render();
      break;
  }
}

function addStaticCircle(x: number, y: number) {
  let mat: Material = {
    name: "temp",
    density: 1,
    restitution: 0.2,
    kineticFriction: 0.2,
    staticFriction: 0.3,
  };

  const c = new CircleShape(5, mat);
  let b = scene.add(c, x, y);
  b.setStatic();
  b.brush = "purple";
}

function getBox(hw: number, hh: number) {
  return [
    pos(-hw, -hh),
    pos(hw, -hh),
    pos(hw, hh),
    pos(-hw, hh),
  ];
}

function addStaticRect(hw: number, hh: number, x: number, y: number) {
  let mat: Material = {
    name: "temp",
    density: 1,
    //  restitution: 1,
    restitution: 0.2,
    kineticFriction: 0.2,
    staticFriction: 0.3,
  };

  const poly = new PolygonShape(getBox(hw, hh), mat);
  const b = scene.add(poly, x, y);
  b.setStatic();
  b.setOrient(0);
  b.brush = "purple";
}

function resetScene() {
  scene.clear();
  addStaticCircle(40, 40);
  addStaticRect(100, 100, 40, 155);
  addStaticRect(100, 100, -95, 28);
  addStaticRect(100, 100, 165, 28);
  addStaticRect(100, 100, 40, -98);
}
