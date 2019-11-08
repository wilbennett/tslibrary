import { AnimationLoop } from '../../../animation';
import { WebColors } from '../../../colors';
import { MathEx } from '../../../core';
import { Ease, EaseRunner, NumberEaser, VectorEaser } from '../../../easing';
import { CanvasContext, ContextProps, Geometry, Graph, Line, Ray, Segment, Viewport } from '../../../twod';
import { UiUtils } from '../../../utils';
import { Vector } from '../../../vectors';

// console.clear();

const canvas = UiUtils.getCanvasElement("canvas");
canvas.width = 300;
canvas.height = 300;
const ctx = new CanvasContext(canvas);

ctx.fillStyle = WebColors.whitesmoke;
ctx.fillRect(ctx.bounds);

Vector.tipDrawHeight = 0.1;
const screenBounds = ctx.bounds;
const origin = Vector.createPosition(0, 0);
const gridSize = 50;
let angle = 0;
const duration = 10;

const graph = new Graph(ctx.bounds, gridSize);
const line1 = new Line(Vector.createPosition(0.7, 0.7), Vector.createDirection(1, 1).rotate(20 * MathEx.ONE_DEGREE));
// const line1 = new Line(Vector.createPosition(0, 0), Vector.createDirection(1, 1));
const line2 = new Line(Vector.createPosition(-0.5, 2), Vector.createDirection(1.5, -2));
const ray1 = new Ray(Vector.createPosition(1, 1), Vector.createDirection(1, 1));
const ray2 = new Ray(Vector.createPosition(-1, -2), Vector.createDirection(1, -2));
const segment1 = new Segment(Vector.createPosition(0.3, -2), Vector.createPosition(2, 0));
const segment2 = new Segment(Vector.createPosition(-1, 1), Vector.createPosition(1, -1));
const point1 = Vector.createPosition(0.5, 0.5);
const point2 = Vector.createPosition(2, 1);

line1.props = { strokeStyle: "blue", fillStyle: "blue" };
line2.props = { strokeStyle: "purple", fillStyle: "purple" };
ray1.props = { strokeStyle: "orange", fillStyle: "orange" };
ray2.props = { strokeStyle: "magenta", fillStyle: "magenta" };
segment1.props = { strokeStyle: "red", fillStyle: "red" };
segment2.props = { strokeStyle: "green", fillStyle: "green" };

const point1Props = { strokeStyle: "black", fillStyle: "black" };
const point2Props = { strokeStyle: "black", fillStyle: "black" };

const geometries: Geometry[] = [
  line1,
  line2,
  ray1,
  ray2,
  segment1,
  segment2,
];

const points: [Vector, ContextProps][] = [
  [point1, point1Props],
  [point2, point2Props],
];

// const scale = new NumberEaser(5, 40, duration, Ease.outCatmullRom2N1, v => graph.gridSize = v);
// const rotate = new NumberEaser(0, 360, duration * 5, Ease.smoothStep, v => angle = v);
const lineRotate = new NumberEaser(0, 90, duration * 0.5, Ease.linear, v => {
  line1.direction.withDegrees(v);
});
const lineRotate2 = new NumberEaser(360, 0, duration * 2, Ease.smoothStep, v => {
  line2.direction.withDegrees(v);
});
const rayRotate = new NumberEaser(0, 360, duration, Ease.smoothStep, v => {
  ray1.direction.withDegrees(v);
});
const rayRotate2 = new NumberEaser(360, 0, duration, Ease.smoothStep, v => {
  ray2.direction.withDegrees(v);
});
const segment1Move = new VectorEaser(
  Vector.createPosition(2, 0),
  Vector.createPosition(-2, 2),
  duration,
  Ease.smoothStep,
  v => segment1.setEnd(v));

const loop = new AnimationLoop(undefined, render);
const runner = new EaseRunner();
runner.add(
  // scale.pingPong().repeat(Infinity),
  // rotate.pingPong().repeat(Infinity),
  lineRotate.pingPong().repeat(Infinity),
  lineRotate2.pingPong().repeat(Infinity),
  rayRotate.pingPong().repeat(Infinity),
  rayRotate2.pingPong().repeat(Infinity),
  segment1Move.pingPong().repeat(Infinity),
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
  renderIntersection(line1, line2, viewport);
  renderIntersection(ray1, ray2, viewport);
  renderIntersection(segment1, segment2, viewport);

  renderIntersection(line2, ray1, viewport);
  renderIntersection(line2, segment1, viewport);

  renderIntersection(ray2, line1, viewport);
  renderIntersection(ray2, segment1, viewport);

  renderIntersection(segment1, line1, viewport);
  renderIntersection(segment2, ray1, viewport);
}

function renderPointContainments(viewport: Viewport) {
  renderPointContainment(line1, point1, viewport);
  renderPointContainment(ray1, point2, viewport);
}

function renderIntersection(a: Geometry, b: Geometry, viewport: Viewport) {
  const point = a.getIntersectPoint(b);

  if (!point) return;

  beginPath(a.props, viewport);
  ctx.strokeCircle(point, 0.1);
}

function renderPointContainment(a: Geometry, point: Vector, viewport: Viewport) {
  if (!a.containsPoint(point)) return;

  beginPath(a.props, viewport);
  ctx.fillCircle(point, 0.2);
}

function beginPath(props: ContextProps, viewport: Viewport) {
  ctx.beginPath().withProps(props).withLineWidth(getLineWidth(props, viewport));
}

function getLineWidth(props: ContextProps, viewport: Viewport) {
  return viewport.calcLineWidth(props.lineWidth !== undefined ? props.lineWidth : 1);
}
