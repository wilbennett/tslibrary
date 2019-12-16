import { AnimationLoop } from '../../../animation';
import { WebColors } from '../../../colors';
import { MathEx } from '../../../core';
import { Brush, CanvasContext, Graph } from '../../../twod';
import { UiUtils } from '../../../utils';
import { pos } from '../../../vectors';
import { Circle, PolygonShape, Scene, Vec2 } from './src';

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
const screenBounds = ctx.bounds;
const origin = new Vec2(0, 0);
const gridSize = 8;
let angle = 0;
const pauseAfterSeconds = 30;

const graph = new Graph(ctx.bounds, gridSize);
// graph.viewCenter = pos(35, -35);
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

  scene.render(view);

  view.restoreTransform();
  restoreTransform();
}

function updateMouse(ev: MouseEvent) {
  const view = graph.getViewport(ctx);
  const rect = canvas.getBoundingClientRect();
  mouse.withXY(ev.clientX - rect.left, ev.clientY - rect.top);
  view.toWorld(mouse, true, mouse);
}

function handleMouseDown(ev: MouseEvent) {
  updateMouse(ev);

  switch (ev.button) {
    case 0:
      /*
      const hw = 2;
      const hh = 2;
      const vertices = [
        new Vec2(-hw, -hh),
        new Vec2(hw, -hh),
        new Vec2(hw, hh),
        new Vec2(-hw, hh),
      ];
      /*/
      const count = MathEx.randomInt(3, 64);
      const vertices = new Array<Vec2>(count);
      const e = MathEx.random(5, 10);

      for (let i = 0; i < count; i++) {
        vertices[i] = new Vec2(MathEx.random(-e, e), MathEx.random(-e, e));
      }
      //*/

      const poly = new PolygonShape();
      poly.set(vertices);
      const b = scene.add(poly, mouse.x, mouse.y);
      b.setOrient(MathEx.random(-Math.PI, Math.PI));
      b.setOrient(0 * Math.PI / 180);
      b.restitution = 1;
      b.restitution = 0.6;
      b.dynamicFriction = 0.2;
      b.staticFriction - 0.3;
      render();
      break;
    case 1:
      break;
    case 2:
      const c = new Circle(MathEx.random(1, 3));
      const body = scene.add(c, mouse.x, mouse.y);
      body.restitution = 1;
      body.restitution = 0.6;
      body.staticFriction - 0.5;
      render();
      break;
  }
}

function createAABB(halfSize: Vec2, position: Vec2, brush?: Brush) {
  const poly = new PolygonShape();
  poly.setBox(halfSize.x, halfSize.y);
  const b = scene.add(poly, position.x, position.y);
  b.setOrient(0);
  b.setStatic();
  b.restitution = 0.2;
  brush && (b.brush = brush);
}

function createWalls(position: Vec2, size: Vec2, wallThickness: number) {
  const halfSize = size.scaleO(0.5);
  const halfWallThickness = wallThickness * 0.5;
  const offset = new Vec2(halfSize.x + halfWallThickness, 0);

  let halfWallSize = new Vec2(halfWallThickness, halfSize.y);
  let wpos = position.addO(offset);
  createAABB(halfWallSize, wpos, "blue"); // Right wall.

  wpos = position.addO(offset.negate());
  createAABB(halfWallSize, wpos, "red"); // Left wall.

  offset.set(0, halfSize.y + halfWallThickness);
  halfWallSize = new Vec2(halfSize.x + wallThickness, halfWallThickness);
  wpos = position.addO(offset);
  createAABB(halfWallSize, wpos, "orange"); // Top wall.

  wpos = position.addO(offset.negate());
  createAABB(halfWallSize, wpos, "green"); // Bottom wall.
}

function addStaticCircle(x: number, y: number) {
  const c = new Circle(5);
  let b = scene.add(c, x, y);
  b.setStatic();
  b.brush = "purple";
  b.restitution = 0.2;
}

function resetScene() {
  scene.clear();
  addStaticCircle(0, -10);
  createWalls(origin, new Vec2(60, 60), 5);
}
