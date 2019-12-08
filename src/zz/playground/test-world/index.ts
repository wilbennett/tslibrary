import { AnimationLoop } from '../../../animation';
import { WebColors } from '../../../colors';
import { MassInfo, Material, MathEx, TimeStep } from '../../../core';
import { EaseRunner } from '../../../easing';
import { Bounds } from '../../../misc';
import { Brush, CanvasContext, ContextProps, Graph, Viewport, World } from '../../../twod';
import {
  Collider,
  Contact,
  ProjectionResolver,
  SimpleBroadPhase,
  SimpleNarrowPhase,
  Wcb,
  Wcb2,
} from '../../../twod/collision';
import { CircleShape, createWalls, Shape } from '../../../twod/shapes';
import { setCircleSegmentCount } from '../../../twod/utils';
import { UiUtils } from '../../../utils';
import { dir, pos, Vector } from '../../../vectors';

// const { ONE_DEGREE } = MathEx;
// const ZERO_DIRECTION = dir(0, 0);

// console.clear();

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
const elChangeShapes = UiUtils.getInputElement("changeshapes");
const elPrevShapes = UiUtils.getInputElement("prevshapes");
const elStep = UiUtils.getInputElement("step");
const elNextShapes = UiUtils.getInputElement("nextshapes");
const elCollider = UiUtils.getSelectElement("collider");

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
  "black",
];

MathEx.epsilon = 0.0001;
Vector.tipDrawHeight = 1.0;
const screenBounds = ctx.bounds;
const origin = pos(0, 0);
const gridSize = 20;
let angle = 0;
// const duration = 5;
const pauseAfterSeconds = Infinity;//30;
let autoChangeShapes = true;
let drawCollision = false;
setCircleSegmentCount(30);
setCircleSegmentCount(360);
setCircleSegmentCount(20);
// setCircleSegmentCount(8);

const graph = new Graph(ctx.bounds.clone(), gridSize);
const world = new World(Bounds.fromCenter(origin, ctx.bounds.size));
const gview = graph.getViewport(ctx);
world.createDefaultView(ctx, gview.viewBounds.clone());

const ballMaterial: Material = {
  name: "ball",
  restitution: 0.7,
  density: 0.6,
  staticFriction: 0.5,
  kineticFriction: 0.3
};

const ball = new CircleShape(2.5);
ball.setPosition(pos(2.5, 7.5));
// ball.setPosition(pos(2.5, -0.5));
// ball.velocity = dir(0, -1);
ball.velocity = dir(0, -0.9);
ball.massInfo = new MassInfo(10, 10);
ball.material = ballMaterial;
const [leftWall, bottomWall, rightWall, topWall] = createWalls(origin, dir(20, 20), 3);

ball.props = { fillStyle: colors[0] };
leftWall.props = { fillStyle: colors[7] };
bottomWall.props = { fillStyle: colors[7] };
rightWall.props = { fillStyle: colors[7] };
topWall.props = { fillStyle: colors[7] };

const normalProps: ContextProps = { strokeStyle: "transparent", lineWidth: 1, lineDash: [] };
const collideProps: ContextProps = { strokeStyle: "teal", lineWidth: 5, lineDash: [0.4, 0.1] };

const shapeSets: Shape[][] = [
  [leftWall, bottomWall, rightWall, topWall, ball],
]

const colliders: [string, Collider][] = [
  ["WCB2", new Wcb2()],
  ["WCB", new Wcb()],
];

let lastRenderTime: DOMHighResTimeStamp | undefined = undefined;
let lastRenderTimeStep: TimeStep | undefined = undefined;
let stepping = elStepping.checked;
let shapeSetIndex = 0;
let shapeSet = shapeSets[shapeSetIndex];
let dragging = false;
let dragTarget: Shape | null = null;
const dragOffset = dir(0, 0);
const dragPos = pos(0, 0);
const mouse = pos(0, 0);
const shapePoint = pos(0, 0);

// const delay = new DelayEaser(2);

const fps = 60;
// const secsPerFrame = 1 / fps;

let frame = -1;
const loop = new AnimationLoop(update, render);
const runner = new EaseRunner(loop);

populateColliders();
drawGraph();
changeShapes();
applyCollider();
loop.start();
runner.start();

elPause.addEventListener("change", () => {
  if (elPause.checked)
    loop.stop();
  else
    loop.start();

  setStepping(false);
});

elChangeShapes.addEventListener("change", () => {
  autoChangeShapes = elChangeShapes.checked;

  if (!autoChangeShapes) return;

  changeShapes();
  rerender();
});

elPrevShapes.addEventListener("click", () => {
  shapeSetIndex = shapeSetIndex > 0 ? shapeSetIndex - 1 : shapeSets.length - 1;
  changeShapes();
  rerender();
});

elNextShapes.addEventListener("click", () => {
  shapeSetIndex = (shapeSetIndex + 1) % shapeSets.length;
  changeShapes();
  rerender();
});

elStep.addEventListener("click", () => {
  setStepping(true);
  step();
});

elCollider.addEventListener("change", () => {
  applyCollider();
});

elStepping.addEventListener("change", () => stepping = elStepping.checked);
canvas.addEventListener("mousemove", handleMouseMove);
canvas.addEventListener("mousedown", handleMouseDown);
canvas.addEventListener("mouseup", handleMouseUp);

function update(now: DOMHighResTimeStamp, timestep: TimeStep) {
  !dragging && world.update(timestep, now);
}

function render(now: DOMHighResTimeStamp, timestep: TimeStep) {
  ++frame === (fps * pauseAfterSeconds) && pause();
  stepping && pause();

  ctx.beginPath().clearRect(ctx.bounds);
  applyTransform();

  setNormalShapeProps();

  drawCollision && world.collidingPairs.forEach(pair => {
    setCollideShapeProps(pair.shapeA);
    setCollideShapeProps(pair.shapeB);
  });

  world.render(timestep, now);

  const view = world.view!;
  view.applyTransform();
  world.contacts.forEach(contact => drawContact(contact, view));
  view.restoreTransform();

  restoreTransform();
  lastRenderTime = now;
  lastRenderTimeStep = timestep;
}

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

function setStepping(value: boolean) {
  stepping = value;
  elStepping.checked = value;
}

function pause() {
  loop.stop();
  elPause.checked = true;
}

function step() {
  if (loop.active) return;

  loop.start();
}

function rerender() {
  if (lastRenderTime === undefined || !lastRenderTimeStep) return;

  render(lastRenderTime, lastRenderTimeStep);
}

function updateMouse(ev: MouseEvent) {
  const view = graph.getViewport(ctx);
  const rect = canvas.getBoundingClientRect();
  mouse.withXY(ev.clientX - rect.left, ev.clientY - rect.top);
  view.toWorld(mouse, true, mouse);
}

function handleMouseMove(ev: MouseEvent) {
  if (!dragTarget) return;
  if (!dragging) return;

  updateMouse(ev);
  mouse.displaceByO(dragOffset, dragPos);
  dragTarget.setPosition(dragPos);
  applyCollider();
  rerender();
}

function handleMouseDown(ev: MouseEvent) {
  if (dragging) return;
  if (ev.button !== 0) return;

  updateMouse(ev);

  for (let i = 0; i < shapeSet.length; i++) {
    const shape = shapeSet[i];
    shape.toLocal(mouse, shapePoint);

    if (!shape.containsPoint(shapePoint, 0.3)) continue;

    shape.position.subO(mouse, dragOffset);
    dragTarget = shape;
    dragging = true;
    break;
  }
}

function handleMouseUp(ev: MouseEvent) {
  if (!dragging) return;
  if (ev.button !== 0) return;

  dragging = false;
  dragTarget = null;
}

function populateColliders() {
  for (const [colliderName] of colliders) {
    elCollider.appendChild(UiUtils.createOption(colliderName));
  }
}

function setNormalShapeProps() {
  shapeSet.forEach(shape => Object.assign(shape.props, normalProps));
}

function setCollideShapeProps(shape: Shape) {
  Object.assign(shape.props, collideProps);
}

function changeShapes() {
  world.clear();
  shapeSet = shapeSets[shapeSetIndex];
  shapeSet.forEach(shape => world.add(shape));
}

function applyCollider() {
  const collider: Collider = colliders.find(c => c[0] === elCollider.value)![1];
  world.broadPhase = new SimpleBroadPhase(collider);
  world.narrowPhase = new SimpleNarrowPhase(collider);
  world.collisionResolver = new ProjectionResolver();
}

function drawContact(contact: Contact, view: Viewport) {
  const propsc: ContextProps = { strokeStyle: "greenyellow", fillStyle: "greenyellow", lineWidth: 2, lineDash: [] };
  const propsr: ContextProps = { strokeStyle: "magenta", fillStyle: "magenta", lineWidth: 4, lineDash: [] };
  const propsi: ContextProps = { strokeStyle: "cyan", fillStyle: "cyan", lineWidth: 4, lineDash: [0.2, 0.2] };
  const propsn: ContextProps = { strokeStyle: "yellow", fillStyle: "yellow", lineWidth: 4, lineDash: [] };

  const normal = contact.normal;
  const refEdge = contact.referenceEdge;
  const incEdge = contact.incidentEdge;
  refEdge && beginPath(propsr, view).line(refEdge.worldStart, refEdge.worldEnd).stroke();
  incEdge && beginPath(propsi, view).line(incEdge.worldStart, incEdge.worldEnd).stroke();

  contact.points.forEach(cp => {
    beginPath(propsc, view).fillRect(Bounds.fromCenter(cp.point, dir(0.5, 0.5)));
    normal.scaleO(cp.depth).render(view, cp.point, propsn);
  });
}

function getLineWidth(props: ContextProps, viewport: Viewport) {
  return viewport.calcLineWidth(props.lineWidth !== undefined ? props.lineWidth : 1);
}

function beginPath(props: ContextProps, view: Viewport) {
  view.ctx.beginPath().withGlobalAlpha(1).withProps(props).withLineWidth(getLineWidth(props, view));
  return view.ctx;
}
