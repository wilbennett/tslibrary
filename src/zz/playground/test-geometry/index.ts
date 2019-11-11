import { AnimationLoop } from '../../../animation';
import { WebColors } from '../../../colors';
import { MathEx } from '../../../core';
import { ConcurrentEaser, Ease, EaseRunner, NumberEaser, SequentialEaser, VectorEaser } from '../../../easing';
import {
  Brush,
  CanvasContext,
  Circle,
  ContextProps,
  Geometry,
  Graph,
  Line,
  Polygon,
  Ray,
  Segment,
  Viewport,
} from '../../../twod';
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
const origin = Vector.createPosition(0, 0);
const gridSize = 50;
let angle = 0;
const duration = 10;

const graph = new Graph(ctx.bounds, gridSize);
const line1 = new Line(Vector.createPosition(0.7, 1.5), Vector.createDirection(1, 0));
const line2 = new Line(Vector.createPosition(-1, 2), Vector.createDirection(1, -1));
const ray1 = new Ray(Vector.createPosition(0.5, 1.2), Vector.createDirection(1, 0));
const ray2 = new Ray(Vector.createPosition(-1, 1.2), Vector.createDirection(-1, 1));
const segment1 = new Segment(Vector.createPosition(-1, 0.7), Vector.createPosition(1.7, 0.7));
const segment2 = new Segment(Vector.createPosition(-1, 0.2), Vector.createPosition(-2.5, 1.7));
const circle1 = new Circle(Vector.createPosition(0.5, -1.5), 0.5);
const poly1 = new Polygon(5, 0.5, 90 * ONE_DEGREE);
poly1.setPosition(Vector.createPosition(-0.5, -1.5));
const poly2 = new Polygon(5, 0.5, 0, false);
poly2.setPosition(Vector.createPosition(-1.5, -0.5));
const point1 = Vector.createPosition(1.7, 0);
// const point2 = Vector.createPosition(2, 1);
// const point3 = Vector.createPosition(2, -2);

line1.props = { strokeStyle: refBrush, fillStyle: refBrush };
line2.props = { strokeStyle: refBrush, fillStyle: refBrush };
ray1.props = { strokeStyle: refBrush, fillStyle: refBrush };
ray2.props = { strokeStyle: refBrush, fillStyle: refBrush };
segment1.props = { strokeStyle: refBrush, fillStyle: refBrush };
segment2.props = { strokeStyle: refBrush, fillStyle: refBrush };
circle1.props = { strokeStyle: refBrush };
poly1.props = { strokeStyle: refBrush };
poly2.props = { strokeStyle: refBrush };

const iline1 = new Line(Vector.createPosition(0.7, 3), Vector.createDirection(1, 0));
const iline2 = new Line(Vector.createPosition(3, 3), Vector.createDirection(1, -1));
const iray1 = new Ray(Vector.createPosition(2, 3), Vector.createDirection(-1, 0));
const iray2 = new Ray(Vector.createPosition(4, 3), Vector.createDirection(-1, 1));
const isegment1 = new Segment(Vector.createPosition(-2, 2.5), Vector.createPosition(1.5, 2.5));
const isegment2 = new Segment(Vector.createPosition(1, 3), Vector.createPosition(3, 1));

iline1.props = { strokeStyle: colors[0], fillStyle: colors[0] };
iline2.props = { strokeStyle: colors[1], fillStyle: colors[1] };
iray1.props = { strokeStyle: colors[0], fillStyle: colors[0] };
iray2.props = { strokeStyle: colors[1], fillStyle: colors[1] };
isegment1.props = { strokeStyle: colors[0], fillStyle: colors[0] };
isegment2.props = { strokeStyle: colors[1], fillStyle: colors[1] };

const point1Props = { strokeStyle: colors[0], fillStyle: colors[0] };
// const point2Props = { strokeStyle: "black", fillStyle: "black" };
// const point3Props = { strokeStyle: "black", fillStyle: "black" };

const testers: Geometry[] = [
  line1,
  line2,
  ray1,
  ray2,
  segment1,
  segment2,
  circle1,
  poly1,
  poly2,
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
  Vector.createPosition(0.7, 3),
  Vector.createPosition(0.7, -3),
  duration,
  Ease.smoothStep,
  v => iline1.point.copyFrom(v));
const iline2Move = new VectorEaser(
  Vector.createPosition(3, 3),
  Vector.createPosition(-3, -3),
  duration,
  Ease.smoothStep,
  v => iline2.point.copyFrom(v));
const iray1Move = new VectorEaser(
  Vector.createPosition(2, 3),
  Vector.createPosition(2, -3),
  duration,
  Ease.smoothStep,
  v => iray1.start.copyFrom(v));
const iray2Move = new VectorEaser(
  Vector.createPosition(4, 3),
  Vector.createPosition(-3, -4),
  duration,
  Ease.smoothStep,
  v => iray2.start.copyFrom(v)
);
const isegment1Move = new VectorEaser(
  Vector.createPosition(-2, 3),
  Vector.createPosition(-2, -3),
  duration,
  Ease.smoothStep,
  v => {
    isegment1.start.copyFrom(v);
    isegment1.end.withY(v.y);
  });
const isegment2Move = new VectorEaser(
  Vector.createPosition(3, 5),
  Vector.createPosition(-5, -3),
  duration,
  Ease.smoothStep,
  v => {
    isegment2.start.copyFrom(v);
    isegment2.end.withXY(v.x + 2, v.y - 2);
  });
const point1Rotate = new NumberEaser(0, 360, duration * 1.2, Ease.linear, v => {
  point1.withDegreesMag(v, point1.mag);
});

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
    .translate(screenBounds.center.negateN());

  graph.render(ctx);

  const viewport = graph.getViewport(ctx);
  viewport.applyTransform();

  geometries.forEach(geometry => geometry.render(viewport));
  points.forEach(([point, props]) => point.render(viewport, origin, props));
  renderIntersections(viewport);
  renderPointContainments(viewport);
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
  ctx.fillCircle(point, 0.2);
}

function beginPath(props: ContextProps, viewport: Viewport) {
  ctx.beginPath().withProps(props).withLineWidth(getLineWidth(props, viewport));
}

function getLineWidth(props: ContextProps, viewport: Viewport) {
  return viewport.calcLineWidth(props.lineWidth !== undefined ? props.lineWidth : 1);
}
