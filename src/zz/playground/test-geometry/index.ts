import { AnimationLoop } from '../../../animation';
import { WebColors } from '../../../colors';
import { MathEx } from '../../../core';
import { ConcurrentEaser, Ease, EaseRunner, NumberEaser, SequentialEaser, VectorEaser } from '../../../easing';
import { Bounds } from '../../../misc';
import {
  Brush,
  CanvasContext,
  Circle,
  ContextProps,
  Geometry,
  Graph,
  Line,
  Plane,
  Polygon,
  Ray,
  Segment,
  Viewport,
} from '../../../twod';
import { AABB } from '../../../twod/geometry/aabb';
import { UiUtils } from '../../../utils';
import { Vector } from '../../../vectors';

const { ONE_DEGREE } = MathEx;

// console.clear();

const canvas = UiUtils.getCanvasElement("canvas");
canvas.width = 300;
canvas.height = 300;
const ctx = new CanvasContext(canvas);

ctx.fillStyle = WebColors.whitesmoke;
ctx.fillRect(ctx.bounds);

const colors: Brush[] = [
  "red",
  "orange",
  "yellowgreen",
  "green",
  "blue",
  "indigo",
  "violet",
];

const refBrush = "teal";
Vector.tipDrawHeight = 0.1;
const screenBounds = ctx.bounds;
const origin = Vector.position(0, 0);
const gridSize = 50;
let angle = 0;
const duration = 10;

const graph = new Graph(ctx.bounds, gridSize);
// const plane1 = new Plane(Vector.createPosition(1, 2), Vector.createPosition(2, 1));
const plane1 = new Plane(Vector.position(-1, -2), Vector.position(-2, -1));
const line1 = new Line(Vector.position(0, 1.5), Vector.position(1, 1.5));
const line2 = new Line(Vector.position(1, 0), Vector.position(0, 1));
const ray1 = new Ray(Vector.position(0.5, 1.2), Vector.direction(1, 0).normalize());
const ray2 = new Ray(Vector.position(-1, 1.2), Vector.direction(-1, 1).normalize());
const segment1 = new Segment(Vector.position(-0.3, 0.7), Vector.position(1, 0.7));
const segment2 = new Segment(Vector.position(-0.5, 0.2), Vector.position(-2, 1.7));
const circle1 = new Circle(Vector.position(0.5, -1.5), 0.5);
const poly1 = new Polygon(5, 0.5, 90 * ONE_DEGREE);
poly1.setPosition(Vector.position(-0.5, -1.5));
const poly2 = new Polygon(5, 0.5, 0, false);
poly2.setPosition(Vector.position(-1.5, -0.5));
const aabb1 = new AABB(Vector.direction(0.3, 0.3));
// const aabb1 = new AABB(Vector.createDirection(0.8, 0.8));
// aabb1.setPosition(Vector.createPosition(-1, 0));
aabb1.setPosition(Vector.position(-1.5, 0.5));
const point1 = Vector.position(1.7, 0);
// const point2 = Vector.createPosition(2, 1);
// const point3 = Vector.createPosition(2, -2);

plane1.props = { strokeStyle: refBrush, fillStyle: refBrush };
line1.props = { strokeStyle: refBrush, fillStyle: refBrush };
line2.props = { strokeStyle: refBrush, fillStyle: refBrush };
ray1.props = { strokeStyle: refBrush, fillStyle: refBrush };
ray2.props = { strokeStyle: refBrush, fillStyle: refBrush };
segment1.props = { strokeStyle: refBrush, fillStyle: refBrush };
segment2.props = { strokeStyle: refBrush, fillStyle: refBrush };
circle1.props = { strokeStyle: refBrush };
poly1.props = { strokeStyle: refBrush };
poly2.props = { strokeStyle: refBrush };
aabb1.props = { strokeStyle: refBrush };

const iline1 = new Line(Vector.position(0, 3), Vector.position(1, 3));
const iline2 = new Line(Vector.position(2, 4), Vector.direction(3, 3));
const iray1 = new Ray(Vector.position(2, 3), Vector.direction(-1, 0).normalize());
const iray2 = new Ray(Vector.position(4, 3), Vector.direction(-1, 1).normalize());
const isegment1 = new Segment(Vector.position(-2, 3), Vector.position(1, 3));
const isegment2 = new Segment(Vector.position(1, 3), Vector.position(3, 1));
isegment2.setPosition(Vector.position(3, 3));

iline1.props = { strokeStyle: colors[0], fillStyle: colors[0] };
iline2.props = { strokeStyle: colors[1], fillStyle: colors[1] };
iray1.props = { strokeStyle: colors[0], fillStyle: colors[0] };
iray2.props = { strokeStyle: colors[1], fillStyle: colors[1] };
isegment1.props = { strokeStyle: colors[0], fillStyle: colors[0] };
isegment2.props = { strokeStyle: colors[1], fillStyle: colors[1] };

const point1Props = { strokeStyle: colors[0], fillStyle: colors[0] };
// const point2Props = { strokeStyle: colors[1], fillStyle: colors[1] };
// const point3Props = { strokeStyle: "black", fillStyle: "black" };

const testers: Geometry[] = [
  plane1,
  line1,
  line2,
  ray1,
  ray2,
  segment1,
  segment2,
  circle1,
  poly1,
  poly2,
  aabb1,
];

const intersectors: Geometry[] = [
  iline1,
  iline2,
  iray1,
  iray2,
  isegment1,
  isegment2,
];

const geometries: Geometry[] = [...testers, ...intersectors];

const points: [Vector, ContextProps][] = [
  [point1, point1Props],
  // [point2, point2Props],
  // [point3, point3Props],
];

// const scale = new NumberEaser(5, 40, duration, Ease.outCatmullRom2N1, v => graph.gridSize = v);
// const rotate = new NumberEaser(0, 360, duration * 5, Ease.smoothStep, v => angle = v);

const iline1Move = new VectorEaser(
  Vector.position(0, 3),
  Vector.position(0, -3.5),
  duration,
  Ease.smoothStep,
  v => iline1.setPosition(v));
const iline2Move = new VectorEaser(
  Vector.position(3, 3),
  Vector.position(-3, -3.5),
  duration,
  Ease.smoothStep,
  v => iline2.setPosition(v));
const iray1Move = new VectorEaser(
  Vector.position(2, 3),
  Vector.position(2, -3.5),
  duration,
  Ease.smoothStep,
  v => iray1.position.copyFrom(v));
const iray2Move = new VectorEaser(
  Vector.position(4, 3),
  Vector.position(-3, -4),
  duration,
  Ease.smoothStep,
  v => iray2.position.copyFrom(v)
);
const isegment1Move = new VectorEaser(
  Vector.position(-0.5, 3),
  Vector.position(-0.5, -3.5),
  duration,
  Ease.smoothStep,
  v => isegment1.setPosition(v));
const isegment2Move = new VectorEaser(
  Vector.position(3, 3),
  Vector.position(-3, -3),
  duration,
  Ease.smoothStep,
  v => isegment2.setPosition(v));
// point1.withMag(2.3 - point1.mag);
const point1Rotate = new NumberEaser(0, 360, duration * 1.2, Ease.linear, v => {
  point1.withDegreesMag(v, point1.mag);
}, () => point1.withMag(2.3 - point1.mag));

const loop = new AnimationLoop(undefined, render);
const runner = new EaseRunner();
runner.add(new SequentialEaser([
  new ConcurrentEaser([iline1Move, iline2Move]),
  new ConcurrentEaser([iray1Move, iray2Move]),
  new ConcurrentEaser([isegment1Move, isegment2Move]),
]).repeat(Infinity),
  new ConcurrentEaser([point1Rotate]).repeat(Infinity),
  // scale.pingPong().repeat(Infinity),
  // rotate.pingPong().repeat(Infinity),
);

loop.start();
runner.start();

function render() {
  ctx.beginPath().withFillStyle("grey").fillRect(ctx.bounds);

  ctx
    .save()
    .translate(screenBounds.center)
    .rotateDegrees(angle)
    .translate(screenBounds.center.negateO());

  graph.render(ctx);

  const viewport = graph.getViewport(ctx);
  viewport.applyTransform();

  geometries.forEach(geometry => geometry.render(viewport));
  points.forEach(([point, props]) => point.render(viewport, origin, props));
  renderIntersections(viewport);
  renderPointContainments(viewport);
  renderClosestPoints(viewport);
  viewport.restoreTransform();

  ctx.restore();
}

function renderIntersections(viewport: Viewport) {
  for (var intersector of intersectors) {
    for (var tester of testers) {
      renderIntersection(intersector, tester, viewport);
    }
  }
}

function renderPointContainments(viewport: Viewport) {
  for (var [point, props] of points) {
    for (var tester of testers) {
      renderPointContainment(tester, point, props, viewport);
    }
  }
}

function renderClosestPoints(viewport: Viewport) {
  for (var [point, props] of points) {
    for (var tester of testers) {
      renderClosestPoint(tester, point, props, viewport);
    }
  }
}

function renderIntersection(a: Geometry, b: Geometry, viewport: Viewport) {
  const point = a.getIntersectPoint(b);

  if (!point) return;

  beginPath(a.props, viewport);
  ctx.strokeCircle(point, 0.1);
}

function renderPointContainment(a: Geometry, point: Vector, props: ContextProps, viewport: Viewport) {
  if (!a.containsPoint(point, 0.05)) return;

  beginPath(props, viewport);
  viewport.ctx.fillStyle = props.fillStyle || props.strokeStyle || "gray";
  ctx.fillCircle(point, 0.1);
}

function renderClosestPoint(a: Geometry, point: Vector, props: ContextProps, viewport: Viewport) {
  const closest = a.closestPoint(point, false);

  if (closest === null || closest === undefined) return;

  beginPath(props, viewport);
  viewport.ctx.fillStyle = props.fillStyle || props.strokeStyle || "gray";
  ctx.fillRect(Bounds.fromCenterHalf(closest.x, closest.y, 0.04, 0.04));

  a.closestPoint(point, true, closest);

  beginPath(props, viewport);
  viewport.ctx.strokeStyle = props.fillStyle || props.strokeStyle || "gray";
  ctx.strokeRect(Bounds.fromCenterHalf(closest.x, closest.y, 0.07, 0.07));
}

function beginPath(props: ContextProps, viewport: Viewport) {
  ctx.beginPath().withProps(props).withLineWidth(getLineWidth(props, viewport));
}

function getLineWidth(props: ContextProps, viewport: Viewport) {
  return viewport.calcLineWidth(props.lineWidth !== undefined ? props.lineWidth : 1);
}
