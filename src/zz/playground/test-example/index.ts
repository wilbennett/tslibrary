import { AnimationLoop } from '../../../animation';
import { WebColors } from '../../../colors';
import { Material, MathEx } from '../../../core';
import { DelayEaser, Ease, Easer, EaseRunner, NumberEaser, SequentialEaser } from '../../../easing';
import { Bounds } from '../../../misc';
import { Brush, CanvasContext, ContextProps, Graph, Line, Viewport } from '../../../twod';
import {
  CircleCollider,
  ClipState,
  Collider,
  ColliderState,
  Contact,
  SATProjection,
  SATSupport,
  ShapePair,
  Sutherland,
  Wcb2,
} from '../../../twod/collision';
import {
  CircleShape,
  PolygonShape,
  setCircleSegmentCount,
  Shape,
  ShapeAxis,
  Simplex,
  UniqueShapeAxesList,
} from '../../../twod/shapes';
import { UiUtils } from '../../../utils';
import { dir, normal, pos, Vector } from '../../../vectors';
import { Gaul, IEMath, Scene } from './src';

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
setCircleSegmentCount(360);
// setCircleSegmentCount(720);
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
  ["WCB2", new CircleCollider(new Wcb2())],
  ["SAT PROJ", new SATProjection()],
  ["SAT SUP", new SATSupport()],
  ["Gaul", new Gaul()],
];

type State = {
  contact?: Contact;
  colliderState?: ColliderState;
  clipState?: ClipState;
};

let stateIndex = -1;
let states: State[] = [];
let stateAnim: Easer | null = null;
const startDelay = new DelayEaser(2);
const delay = new DelayEaser(2);

let frame = -1;
const loop = new AnimationLoop(update, render);
const runner = new EaseRunner();

populateColliders();
applyCollider();
drawGraph();
resetScene();
loop.start();
runner.start();

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

IEMath.gravityStrength = 0;
const hw = 5;
const hh = 2;
const vertices = [
  pos(-hw, -hh),
  pos(hw, -hh),
  pos(hw, hh),
  pos(-hw, hh),
];
const p1 = new PolygonShape(vertices, materials.bouncy);
scene.add(p1, 15, 10);
p1.angle = 0 * Math.PI / 180;
p1.props = { strokeStyle: "magenta", lineWidth: 2 };
const forceProps = { strokeStyle: "yellow", lineWidth: 2 };
const forcePoint = p1.toWorld(p1.vertexList.items[1].displaceByO(dir(-3, 0)));
const force = p1.toWorld(dir(40 * 10, 0)).rotate(10 * Math.PI / 180);

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

function createStateAnim() {
  const count = states.length;

  if (count === 0) return;

  const anim = new NumberEaser(0, count - 1, MathEx.clamp(count * 1.0, 2, 10), Ease.linear, v => {
    // if (stepping) return;

    stateIndex = Math.round(v);
    !loop.active && render();
  });

  stateAnim = new SequentialEaser([startDelay, new SequentialEaser([anim, delay])]).repeat(Infinity);
  runner.add(stateAnim);
}

function pushColliderState(colliderState: ColliderState) {
  states.push({ colliderState });
}

function pushClipState(clipState: ClipState) {
  // clipState.contact.ensureNormalDirection();
  states.push({ clipState });
}

function update() {
  const view = graph.getViewport(ctx);

  for (let i = scene.bodies.length - 1; i >= 0; i--) {
    const body = scene.bodies[i];

    if (body.position.y < view.viewBounds.bottom)
      scene.bodies.remove(body);
  }

  if (frame === (60 * 2)) {
    p1.integrator.applyForceAt(forcePoint, force);
  }

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

  force.render(view, forcePoint.displaceByNegO(force), forceProps);

  stateIndex >= 0 && drawState(states[stateIndex], view);

  const contacts = scene.contacts;
  const contact = contacts.length > 0 && contacts[0].contact;

  /*
  if (contacts.length === 1 && contact) {
    const pair = contact.shapes;
    drawSat(pair, view);
    drawContact(contact, view);
  }
  //*/
  /*
  if (scene.bodies.length === 2) {
    const bodies = scene.bodies;
    const shapeA = bodies[0].shape;
    const shapeB = bodies[1].shape;
    const pair = new ShapePair(shapeA, shapeB);
    shapeA.render(view);
    shapeB.render(view);
    drawSat(pair, view);

    // contact && drawContact(contact, view);

    const polydBrush = contact ? "red" : "green";
    const polyd = Minkowski.createDiffPoly(pair.shapeA, pair.shapeB);
    polyd && (polyd.props = { strokeStyle: polydBrush, lineWidth: 3 });
    polyd && (polyd.props.strokeStyle = polydBrush) && polyd.render(view);
  }
  //*/
  // contact && drawContact(contact, view);

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
      // const c = new CircleShape(3, mat);
      const b2 = scene.add(c, mouse.x, mouse.y);
      b2.setOrient(110 * Math.PI / 180);
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
  //*
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
  // createWalls(origin, dir(20, 20), 5);
}

function beginPath(props: ContextProps, viewport: Viewport) {
  ctx.beginPath().withGlobalAlpha(1).withProps(props).withLineWidth(getLineWidth(props, viewport));
  return ctx;
}

function getLineWidth(props: ContextProps, viewport: Viewport) {
  return viewport.calcLineWidth(props.lineWidth !== undefined ? props.lineWidth : 1);
}

function drawShapeProjection(shape: Shape, axis: ShapeAxis, axisLine: Line, view: Viewport, offset: number = 0) {
  const projection = shape.projectOn(axis.worldNormal);

  if (!projection) return;

  const minPoint = projection.minPoint;
  const maxPoint = projection.maxPoint;

  const ofs = axis.worldNormal.perpLeftO().scale(offset);
  const minClosest = axisLine.closestPoint(minPoint).displaceBy(ofs);
  const maxClosest = axisLine.closestPoint(maxPoint).displaceBy(ofs);

  const ctx = view.ctx;
  const props: ContextProps = {};
  Object.assign(props, shape.props);

  props.lineDash = [];
  props.lineWidth = 3;
  beginPath(props, view);
  ctx.line(minClosest, maxClosest).stroke();

  props.lineDash = [0.2, 0.2];
  props.globalAlpha = 0.2;
  beginPath(props, view);
  ctx.line(minPoint, minClosest).stroke();
  ctx.line(maxPoint, maxClosest).stroke();
}

function drawProjection(pair: ShapePair, axis: ShapeAxis, axisLine: Line, view: Viewport) {
  const { shapeA: first, shapeB: second } = pair;
  drawShapeProjection(first, axis, axisLine, view, 0.5);
  drawShapeProjection(second, axis, axisLine, view);
}

function createAxisLine(axis: ShapeAxis, radius: number) {
  const props: ContextProps = { strokeStyle: "black", lineDash: [0.5, 0.5], lineWidth: 2, globalAlpha: 0.5 };
  const origin = Vector.position(0, 0);
  const dir = axis.worldNormal.perpRightO().scale(radius);
  const line = new Line(origin, origin.displaceByO(axis.worldNormal));
  line.setPosition(dir.asPosition());
  line.props = props;
  return line;
}

function drawSat(shapes: ShapePair, view: Viewport) {
  const { shapeA: first, shapeB: second } = shapes;
  const axesList = new UniqueShapeAxesList(true);

  axesList.addAxes([
    ...first.getAxes(),
    ...second.getAxes(),
    ...first.getDynamicAxes(second),
    ...second.getDynamicAxes(first),
  ]);

  const axes = axesList.items;
  // console.log(`axes count: ${axes.length}`);
  // console.log(`axes: ${axes.map(a => a.worldNormal.toString())}`);
  const radius = view.viewBounds.halfSize.x * 0.8;
  const axesLines = axes.map(a => createAxisLine(a, radius));

  // const ctx = view.ctx;
  // const props: ContextProps = { strokeStyle: "black", lineDash: [0.2, 0.2] };
  // beginPath(props, view);
  // ctx.strokeCircle(0, 0, radius);
  axesLines.forEach(a => a.render(view));
  axes.forEach((a, i) => drawProjection(shapes, a, axesLines[i], view));
}

function drawContact(contact: Contact, view: Viewport) {
  const propsc: ContextProps = { strokeStyle: WebColors.yellow, fillStyle: WebColors.yellow, lineWidth: 2, lineDash: [] };
  const propsr: ContextProps = { strokeStyle: "purple", fillStyle: "purple", lineWidth: 4, lineDash: [] };
  const propsi: ContextProps = { strokeStyle: "orange", fillStyle: "orange", lineWidth: 4, lineDash: [0.2, 0.2] };
  const propsn: ContextProps = { strokeStyle: "yellow", fillStyle: "yellow", lineWidth: 4, lineDash: [] };

  const normal = contact.normal;
  const refEdge = contact.referenceEdge;
  const incEdge = contact.incidentEdge;
  // const mkNormal = contact.minkowskiNormal;
  // const mkDepth = contact.minkowskiDepth || 1;
  refEdge && beginPath(propsr, view).line(refEdge.start, refEdge.end).stroke();
  incEdge && beginPath(propsi, view).line(incEdge.start, incEdge.end).stroke();

  contact.points.forEach(cp => {
    // beginPath(propsc, view).fillRect(Bounds.fromCenter(cp.point.clone(), dir(0.5, 0.5)));
    beginPath(propsc, view).fillRect(Bounds.fromCenter(cp.point.clone(), dir(1, 1)));
    normal.scaleO(cp.depth).render(view, cp.point, propsn);
  });

  // mkNormal && mkNormal.scaleO(mkDepth).render(view, origin, mkNormalProps);
}

function drawClipState(clip: ClipState, view: Viewport) {
  const propsr: ContextProps = { strokeStyle: "purple", fillStyle: "purple", lineWidth: 4, lineDash: [] };
  const propsi: ContextProps = { strokeStyle: "black", fillStyle: "black", lineWidth: 4, lineDash: [0.2, 0.2] };
  const propsp: ContextProps = { strokeStyle: WebColors.blueviolet, fillStyle: WebColors.blueviolet, lineWidth: 3, lineDash: [] };
  const propsn: ContextProps = { strokeStyle: WebColors.blueviolet, fillStyle: WebColors.blueviolet, lineWidth: 4, lineDash: [] };
  const propsc: ContextProps = { strokeStyle: WebColors.gray, fillStyle: WebColors.gray, lineWidth: 4, lineDash: [] };

  const contact = clip.contact;
  const plane = clip.clipPlane;
  const refEdge = contact.referenceEdge;
  const incEdge = contact.incidentEdge;
  const points = contact.points;
  const normal = contact.normal;
  refEdge && beginPath(propsr, view).line(refEdge.start, refEdge.end).stroke();
  incEdge && beginPath(propsi, view).line(incEdge.start, incEdge.end).stroke();
  contact && drawContact(contact, view);

  points.forEach(cp => {
    beginPath(propsp, view).strokeRect(Bounds.fromCenter(cp.point.clone(), dir(0.8, 0.8)));
    normal && normal.scaleO(cp.depth).render(view, cp.point, propsc);
  });

  plane && (plane.props = propsn) && plane.render(view);
}

function drawSimplex(simplex: Simplex, view: Viewport) {
  const props1: ContextProps = { strokeStyle: "red", fillStyle: "red", lineWidth: 2, lineDash: [0.1, 0.1] };
  const props2: ContextProps = { strokeStyle: "green", fillStyle: "green", lineWidth: 2, lineDash: [0.1, 0.1] };
  const props3: ContextProps = { strokeStyle: "blue", fillStyle: "blue", lineWidth: 2, lineDash: [0.1, 0.1] };
  const propsd: ContextProps = { strokeStyle: "magenta", fillStyle: "magenta", lineWidth: 3, lineDash: [] };
  const propso: ContextProps = { strokeStyle: "black", lineWidth: 1, lineDash: [] };
  propso.lineWidth = view.calcLineWidth(propso.lineWidth || 1);
  const points = simplex.points;
  let directionOrigin: Vector = pos(0, 0);
  let a: Vector;
  let b: Vector;
  let c: Vector;

  switch (points.length) {
    case 1:
      a = points[0].worldPoint;
      beginPath(props1, view).fillCircle(a, 0.7).beginPath().withProps(propso).strokeCircle(a, 0.7);
      directionOrigin = a;
      break;
    case 2:
      a = points[1].worldPoint;
      b = points[0].worldPoint;
      beginPath(props2, view).fillCircle(a, 0.7).beginPath().withProps(propso).strokeCircle(a, 0.7);
      beginPath(props1, view).fillCircle(b, 0.6).beginPath().withProps(propso).strokeCircle(b, 0.6);
      a.subO(b).render(view, b, props1);
      directionOrigin = a.addO(b).normalizeW();
      break;
    case 3:
      a = points[2].worldPoint;
      b = points[1].worldPoint;
      c = points[0].worldPoint;
      beginPath(props3, view).fillCircle(a, 0.7).beginPath().withProps(propso).strokeCircle(a, 0.7);
      beginPath(props2, view).fillCircle(b, 0.6).beginPath().withProps(propso).strokeCircle(b, 0.6);
      beginPath(props1, view).fillCircle(c, 0.5).beginPath().withProps(propso).strokeCircle(c, 0.5);
      b.subO(c).render(view, c, props1);
      a.subO(b).render(view, b, props2);
      c.subO(a).render(view, a, props3);
      directionOrigin = c.addO(b).normalizeW();
      break;
  }

  simplex.direction.normalizeScaleO(2).render(view, directionOrigin, propsd);
}

function drawState(state: State, view: Viewport) {
  state.clipState && drawClipState(state.clipState, view);
  state.contact && drawContact(state.contact, view);

  if (state.colliderState) {
    const colliderState = state.colliderState;
    colliderState.simplices && colliderState.simplices.forEach(simplex => drawSimplex(simplex, view));
    colliderState.contact && drawContact(colliderState.contact, view);
  }
}
