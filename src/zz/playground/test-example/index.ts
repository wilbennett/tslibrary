import { AnimationLoop } from '../../../animation';
import { WebColors } from '../../../colors';
import { Material, MathEx } from '../../../core';
import { Brush, CanvasContext, Graph } from '../../../twod';
import { Collider, SATProjection, SATSupport, Sutherland, Wcb2 } from '../../../twod/collision';
import { CircleShape, PolygonShape } from '../../../twod/shapes';
import { UiUtils } from '../../../utils';
import { dir, pos, Vector } from '../../../vectors';
import { Gaul, Scene } from './src';

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
const elCollider = UiUtils.getSelectElement("collider");

ctx.fillStyle = WebColors.whitesmoke;
ctx.fillRect(ctx.bounds);

MathEx.epsilon = 0.0001;
const screenBounds = ctx.bounds;
const origin = pos(0, 0);
const gridSize = 8;
let angle = 0;
const pauseAfterSeconds = 30;

const graph = new Graph(ctx.bounds, gridSize);
graph.background = "black";
graph.lineBrush = "rgba(70, 70, 70)";
const clipper = new Sutherland();
const scene = new Scene(1 / 60, 10);

const colliders: [string, Collider][] = [
  ["SAT SUP", new SATSupport()],
  ["Gaul", new Gaul()],
  ["WCB2", new Wcb2()],
  ["SAT PROJ", new SATProjection()],
];

let frame = -1;
const loop = new AnimationLoop(update, render);

populateColliders();
applyCollider();
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

elCollider.addEventListener("change", () => {
  applyCollider();

  if (!loop.active)
    render();
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
      const hw = 5;
      const hh = 2;
      const vertices = [
        pos(-hw, -hh),
        pos(hw, -hh),
        pos(hw, hh),
        pos(-hw, hh),
      ];

      const poly = new PolygonShape(vertices, mat);
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

function populateColliders() {
  for (const [colliderName, collider] of colliders) {
    elCollider.appendChild(UiUtils.createOption(colliderName));

    if (!(collider instanceof Gaul))
      collider.clipper = clipper;
  }
}

function applyCollider() {
  const collider: Collider = colliders.find(c => c[0] === elCollider.value)![1];
  scene.collider = collider;
}

function createAABB(halfSize: Vector, position: Vector, brush?: Brush) {
  const hw = halfSize.x;
  const hh = halfSize.y;

  const vertices = [
    pos(-hw, -hh),
    pos(hw, -hh),
    pos(hw, hh),
    pos(-hw, hh),
  ];

  const poly = new PolygonShape(vertices);
  const b = scene.add(poly, position.x, position.y);
  b.setOrient(0);
  b.setStatic();
  brush && (poly.props = { strokeStyle: brush, lineWidth: 2 });
}

function createWalls(position: Vector, size: Vector, wallThickness: number) {
  const halfSize = size.scaleO(0.5);
  const halfWallThickness = wallThickness * 0.5;
  const offset = dir(halfSize.x + halfWallThickness, 0);
  let halfWallSize: Vector;
  let wpos: Vector;
  /*
    halfWallSize = dir(halfWallThickness, halfSize.y);
    wpos = position.addO(offset);
    createAABB(halfWallSize, wpos, "blue"); // Right wall.
  
    wpos = position.addO(offset.negate());
    createAABB(halfWallSize, wpos, "red"); // Left wall.
  //*/
  offset.set(0, halfSize.y + halfWallThickness);
  halfWallSize = dir(halfSize.x + wallThickness, halfWallThickness);
  /*
  wpos = position.addO(offset);
  createAABB(halfWallSize, wpos, "orange"); // Top wall.
//*/
  wpos = position.addO(offset.negate());
  createAABB(halfWallSize, wpos, "green"); // Bottom wall.
}

function addStaticCircle(x: number, y: number) {
  const c = new CircleShape(5);
  let b = scene.add(c, x, y);
  b.setStatic();
  b.brush = "purple";
}

function resetScene() {
  scene.clear();
  // addStaticCircle(0, -10);
  createWalls(origin, dir(60, 60), 5);
}
