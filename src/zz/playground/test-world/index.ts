import { AnimationLoop } from '../../../animation';
import { WebColors } from '../../../colors';
import { Material, MathEx, TimeStep } from '../../../core';
import { EaseRunner } from '../../../easing';
import { Bounds } from '../../../misc';
import { Brush, CanvasContext, ContextProps, Graph, Viewport, World } from '../../../twod';
import {
  CircleCollider,
  Collider,
  CollisionResolver,
  Contact,
  Impulse,
  LinearImpulse,
  ProjectionResolver,
  SimpleBroadPhase,
  SimpleNarrowPhase,
  Sutherland,
  Wcb,
  Wcb2,
} from '../../../twod/collision';
import { AntiGravitational, Fan, Fluid, ForceSource, Gravitational, Wind } from '../../../twod/forces';
import { AABBShape, CircleShape, createWalls, PolygonShape, setCircleSegmentCount, Shape } from '../../../twod/shapes';
import { UiUtils } from '../../../utils';
import { dir, pos, Vector } from '../../../vectors';
import { Gaul } from '../test-example/src';

// const { ONE_DEGREE } = MathEx;
// const ZERO_DIRECTION = dir(0, 0);

// console.clear();

const gridExtent = Math.min(window.innerWidth, window.innerHeight);
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
const elCollideResolve = UiUtils.getSelectElement("collideresolve");

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
// let drawCollision = false;
setCircleSegmentCount(30);
setCircleSegmentCount(360);
setCircleSegmentCount(20);
// setCircleSegmentCount(8);

let [graph, world] = createGraphAndWorld();

const materials: { [index: string]: Material } = {
  default: {
    name: "default",
    restitution: 0.2,
    density: 0,
    staticFriction: 0.5,
    kineticFriction: 0.3
  },

  bouncy: {
    name: "bouncy",
    restitution: 0.7,
    density: 0.6,
    staticFriction: 0.5,
    kineticFriction: 0.3
  },

  superBouncy: {
    name: "super bouncy",
    restitution: 0.9,
    density: 0.6,
    staticFriction: 0.5,
    kineticFriction: 0.3
  },

  wood: {
    name: "wood",
    restitution: 0.4,
    density: 0.6,
    staticFriction: 0.5,
    kineticFriction: 0.3
  },

  plastic: {
    name: "plastic",
    restitution: 0.2,
    density: 0.6,
    staticFriction: 0.5,
    kineticFriction: 0.3
  },
};

const defaultMaterial = materials.default;
const bouncy = materials.bouncy;
const superBouncy = materials.superBouncy;
const plastic = materials.plastic;
// const wood = materials.wood;

// for (const name in materials) { materials[name].restitution = 1; }
// for (const name in materials) { materials[name].staticFriction = 0; }
// for (const name in materials) { materials[name].kineticFriction = 0; }

CircleShape;
// TODO: Something weird happening with rotated circles and collision detection. Need to investigate.
const ball = new CircleShape(2.5, superBouncy);
// const ball = new AABBShape(dir(2.5, 2.5), bouncy);
ball.setPosition(pos(2.5, 7.5));
const ball1 = new CircleShape(1.5, superBouncy);
ball1.setPosition(pos(-2.5, 7.5));
// ball.setPosition(pos(2.5, -0.5));
// ball.velocity = dir(0, -1);
// ball.velocity = dir(0, -0.2);
const ball2 = new AABBShape(dir(5.5, 0.2), plastic);
ball2.setPosition(pos(2.5, 7.5));
ball2.velocity = dir(0, -0.2);
const ball3 = new AABBShape(dir(2.5, 2.5), plastic);
// const ball3 = new CircleShape(2.5, plastic);
ball3.setPosition(pos(2.5, 7.5));
ball3.velocity = dir(0, -0.2);
const triangle = new PolygonShape([pos(1, -5), pos(5, -5), pos(5, 0)], plastic);
// triangle.velocity = dir(0, -0.2);
const wind = new Wind(dir(0, 5));
const windShape = new AABBShape(dir(8, 2.5));
windShape.addAttachedForce(wind);
windShape.isCustomCollide = true;
windShape.position = pos(0, -4.5);
const fan = new Fan(5, dir(0, 4));
fan.position = pos(0, -4.5);
const fluid = new Fluid(40);
const fluidShape = new AABBShape(dir(8, 2.5));
fluidShape.addAttachedForce(fluid);
fluidShape.isCustomCollide = true;
fluidShape.position = pos(0, -4.5);
const gravitational = new Gravitational(ball1.massInfo.mass * 100000000000000, 8, 80);
const antiGravitational = new AntiGravitational(ball1.massInfo.mass * 10000000000000, 3, 7);
const antiGravitational2 = new AntiGravitational(ball1.massInfo.mass * 10000000000000, 3, 7);
// antiGravitational2.position.withXY(-10, -10);
antiGravitational2.position = ball.position;
// const vehicleShape = new PolygonShape([pos(0, -0.5), pos(0.5, -0.5), pos(1.5, 0), pos(0.5, 0.5), pos(0, 0.5)], plastic);
// vehicleShape.setPosition(pos(0, 7.5));
const [leftWall, bottomWall, rightWall, topWall] = createWalls(origin, dir(20, 20), 3);
leftWall.material = defaultMaterial;
bottomWall.material = defaultMaterial;
rightWall.material = defaultMaterial;
topWall.material = defaultMaterial;

// world.gravityConst = 0;
// vehicleShape.velocity.withXY(0, -0.1);
// ball.integratorType = EulerExplicit;
// ball2.integratorType = EulerExplicit;
// ball3.integratorType = EulerExplicit;
// triangle.integratorType = EulerExplicit;

ball.props = { fillStyle: colors[0], strokeStyle: colors[7], lineWidth: 2 };
ball1.props = { fillStyle: colors[0], strokeStyle: colors[7], lineWidth: 2 };
ball2.props = { fillStyle: colors[0], strokeStyle: colors[7], lineWidth: 2 };
ball3.props = { fillStyle: colors[0], strokeStyle: colors[7], lineWidth: 2 };
triangle.props = { fillStyle: colors[1] };
windShape.props = { fillStyle: "transparent", strokeStyle: "gray", lineWidth: 1 };
fan.props = { fillStyle: "transparent", strokeStyle: "magenta", lineWidth: 1 };
fluidShape.props = { fillStyle: "transparent", strokeStyle: "green", lineWidth: 1 };
// vehicleShape.props = { fillStyle: colors[0], strokeStyle: colors[7], lineWidth: 2 };
leftWall.props = { fillStyle: colors[0] };
bottomWall.props = { fillStyle: colors[1] };
rightWall.props = { fillStyle: colors[2] };
topWall.props = { fillStyle: colors[3] };

const shapeSets: Shape[][] = [
  [leftWall, bottomWall, rightWall, topWall, windShape],
  // [bottomWall, ball, ball1],
  [ball],
  [bottomWall, ball, ball1],
  [leftWall, bottomWall, rightWall, ball],
  [leftWall, bottomWall, rightWall, ball],
  [leftWall, bottomWall, rightWall, ball, fluidShape],
  [leftWall, bottomWall, rightWall, ball],
  [leftWall, bottomWall, rightWall, topWall, ball2],
  [leftWall, bottomWall, rightWall, topWall, ball2, triangle],
  [leftWall, bottomWall, rightWall, topWall, ball3, triangle],
];

const forceSets: ForceSource[][] = [
  [],
  [gravitational],
  [wind],
  [antiGravitational, antiGravitational2],
  [fan],
  [],
  [],
  [],
  [],
  [],
];

const wcb2 = new Wcb2();
const wcb = new Wcb();

const colliders: [string, Collider][] = [
  ["WCB2", new CircleCollider(wcb2)],
  ["Gaul", new Gaul()],
  ["WCB", new CircleCollider(wcb)],
];

const collisionResolvers: [string, CollisionResolver][] = [
  ["Impulse", new Impulse()],
  ["Linear", new LinearImpulse()],
  ["Projection", new ProjectionResolver()],
];

const clipper = new Sutherland();
wcb2.clipper = clipper;
wcb.clipper = clipper;

colliders.forEach(entry => entry[1].clipper = clipper);

let lastRenderTime: DOMHighResTimeStamp | undefined = undefined;
let lastRenderTimeStep: TimeStep | undefined = undefined;
let stepping = elStepping.checked;
let shapeSetIndex = 0;
let shapeSet = shapeSets[shapeSetIndex];
let forceSet = forceSets[shapeSetIndex];
let currentShapes: Shape[] = [];
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
populateCollisionResolvers();
drawGraph();
changeShapes();
applyCollider();
applyCollisionResolver();
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

elCollideResolve.addEventListener("change", () => {
  applyCollisionResolver();
});

window.addEventListener("resize", () => {
  [graph, world] = createGraphAndWorld();
  drawGraph();
  applyCollider();
  changeShapes();
  rerender();
});

elStepping.addEventListener("change", () => stepping = elStepping.checked);
canvas.addEventListener("mousemove", handleMouseMove);
canvas.addEventListener("mousedown", handleMouseDown);
canvas.addEventListener("dblclick", handleMouseDoubleClick);
canvas.addEventListener("mouseup", handleMouseUp);
canvas.addEventListener("contextmenu", ev => ev.preventDefault());

function update(now: DOMHighResTimeStamp, timestep: TimeStep) {
  const view = graph.getViewport(ctx);

  for (const shape of world.shapes) {
    if (shape.position.y < view.viewBounds.bottom * 4) {
      shapeSet.remove(shape);
      currentShapes.remove(shape);
      world.remove(shape);
    }
  }

  !dragging && world.update(now, timestep);
}

const propsv: ContextProps = { strokeStyle: "cyan", fillStyle: "cyan", lineWidth: 4, lineDash: [] };

function render(now: DOMHighResTimeStamp, timestep: TimeStep) {
  ++frame === (fps * pauseAfterSeconds) && pause();
  stepping && pause();

  ctx.beginPath().clearRect(ctx.bounds);
  applyTransform();

  world.render(now, timestep);

  const view = world.view!;
  view.applyTransform();

  world.shapes.forEach(shape => {
    shape.velocity
      .normalizeO().scale(0.5)
      //.scaleO(5)
      .render(view, shape.position, propsv);
  });

  world.contacts.forEach(contact => drawContact(contact, view));
  view.restoreTransform();

  // ball.angle += 1 * ONE_DEGREE;
  // triangle.angle += 1 * ONE_DEGREE;

  restoreTransform();
  lastRenderTime = now;
  lastRenderTimeStep = timestep;
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

function createGraphAndWorld(): [Graph, World] {
  const gridExtent = Math.min(window.innerWidth, window.innerHeight);
  canvasb.width = gridExtent;
  canvasb.height = gridExtent;
  canvas.width = gridExtent;
  canvas.height = gridExtent;

  let graph = new Graph(ctx.bounds.clone(), gridSize);
  graph.background = "black";
  graph.lineBrush = "rgba(70, 70, 70)";
  let world = new World(Bounds.fromCenter(origin, ctx.bounds.size));
  const gview = graph.getViewport(ctx);
  world.createDefaultView(ctx, gview.viewBounds.clone());
  return [graph, world];
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
  updateMouse(ev);

  if (ev.button === 1) {
    for (let i = currentShapes.length - 1; i >= 0; i--) {
      const shape = currentShapes[i];
      currentShapes.remove(shape);
      world.remove(shape);
    }

    rerender();
    return;
  }

  if (ev.ctrlKey && ev.button === 2) {
    addRandomShape(pos(-5, 12));
    addRandomShape(pos(0, 12));
    addRandomShape(pos(5, 12));
    rerender();
    return;
  }

  if (ev.button === 2) {
    addRandomShape(mouse);
    rerender();
    return;
  }

  if (dragging) return;
  if (ev.button !== 0) return;

  for (const shape of world.shapes) {
    if (shape === leftWall || shape === bottomWall || shape === rightWall || shape === topWall) continue;

    shape.toLocal(mouse, shapePoint);

    if (!shape.containsPoint(shapePoint, 0.3)) continue;

    shape.position.subO(mouse, dragOffset);
    dragTarget = shape;
    dragging = true;
    break;
  }
}

function handleMouseDoubleClick(ev: MouseEvent) {
  updateMouse(ev);

  if (ev.button !== 0) return;

  for (const shape of world.shapes) {
    if (shape === leftWall || shape === bottomWall || shape === rightWall || shape === topWall) continue;

    shape.toLocal(mouse, shapePoint);

    if (!shape.containsPoint(shapePoint, 0.3)) continue;

    // shapeSet.remove(shape);
    world.remove(shape);
    rerender();
    break;
  }
}

function handleMouseUp(ev: MouseEvent) {
  if (!dragging) return;
  if (ev.button !== 0) return;

  dragging = false;
  dragTarget = null;
}

function setShapeProps(shape: Shape) {
  const background = MathEx.random(colors);
  let stroke = MathEx.random(colors);
  while (stroke === background) stroke = MathEx.random(colors);
  shape.props = { fillStyle: background, strokeStyle: stroke, lineWidth: 2 };
}

function addShape(shape: Shape, position: Vector) {
  shape.setPosition(position);
  setShapeProps(shape);
  currentShapes.push(shape);
  world.add(shape);
}

function addRandomCircle(position: Vector) {
  const shape = new CircleShape(MathEx.randomInt(1, 3), bouncy);
  addShape(shape, position);
}

function addRandomPoly(position: Vector) {
  const radius = MathEx.randomInt(2, 3);
  const isRegular = Math.random() < 0.2;
  const shape = new PolygonShape(MathEx.randomInt(3, 8), radius, 0, isRegular, bouncy);
  addShape(shape, position);
}

function addRandomShape(position: Vector) {
  if (Math.random() < 0.2)
    addRandomCircle(position);
  else
    addRandomPoly(position);
}

function populateColliders() {
  for (const [colliderName] of colliders) {
    elCollider.appendChild(UiUtils.createOption(colliderName));
  }
}

function populateCollisionResolvers() {
  for (const [resolverName] of collisionResolvers) {
    elCollideResolve.appendChild(UiUtils.createOption(resolverName));
  }
}

function changeShapes() {
  world.clear();
  shapeSet = shapeSets[shapeSetIndex];
  shapeSet.forEach(shape => world.add(shape));
  forceSet = forceSets[shapeSetIndex];
  forceSet.forEach(force => world.addForce(force));
  currentShapes = [];
}

function applyCollisionResolver() {
  const resolver: CollisionResolver = collisionResolvers.find(c => c[0] === elCollideResolve.value)![1];
  world.collisionResolver = resolver;
}

function applyCollider() {
  const collider: Collider = colliders.find(c => c[0] === elCollider.value)![1];
  world.broadPhase = new SimpleBroadPhase(collider);
  world.narrowPhase = new SimpleNarrowPhase(collider);
}

function drawContact(contact: Contact, view: Viewport) {
  // const propsc: ContextProps = { strokeStyle: "greenyellow", fillStyle: "greenyellow", lineWidth: 2, lineDash: [] };
  const propsr: ContextProps = { strokeStyle: "magenta", fillStyle: "magenta", lineWidth: 2, lineDash: [] };
  const propsi: ContextProps = { strokeStyle: "cyan", fillStyle: "cyan", lineWidth: 2, lineDash: [0.2, 0.2] };
  const propsn: ContextProps = { strokeStyle: "yellow", fillStyle: "yellow", lineWidth: 1, lineDash: [] };
  const propsnab: ContextProps = { strokeStyle: "yellow", fillStyle: "yellow", lineWidth: 1, lineDash: [0.2, 0.2] };
  const propsrv: ContextProps = { strokeStyle: "green", fillStyle: "green", lineWidth: 1, lineDash: [] };

  const scaling = 4;
  const normal = contact.normal;
  const normalAB = contact.normalAB;
  const refEdge = contact.referenceEdge;
  const incEdge = contact.incidentEdge;
  refEdge && beginPath(propsr, view).line(refEdge.start, refEdge.end).stroke();
  incEdge && beginPath(propsi, view).line(incEdge.start, incEdge.end).stroke();

  contact.points.forEach(cp => {
    // beginPath(propsc, view).fillRect(Bounds.fromCenter(cp.point, dir(0.5, 0.5)));
    // normal.scaleO(cp.depth).render(view, cp.point, propsn);
    normal.scaleO(cp.depth).scaleO(scaling).render(view, cp.point, propsn);
    normalAB.scaleO(cp.depth).scaleO(scaling).render(view, cp.point, propsnab);

    const relativeVelocity = cp.relativeVelocity;
    relativeVelocity && relativeVelocity.scaleO(scaling).render(view, cp.point, propsrv);
  });
}

function getLineWidth(props: ContextProps, viewport: Viewport) {
  return viewport.calcLineWidth(props.lineWidth !== undefined ? props.lineWidth : 1);
}

function beginPath(props: ContextProps, view: Viewport) {
  view.ctx.beginPath().withGlobalAlpha(1).withProps(props).withLineWidth(getLineWidth(props, view));
  return view.ctx;
}
