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

const screenBounds = ctx.bounds;
const gridSize = 50;
let angle = 0;
const duration = 5;

const graph = new Graph(ctx.bounds, gridSize);
const line1 = new Line(Vector.createPosition(0.5, 0.5), Vector.createDirection(1, 1).rotate(20 * MathEx.ONE_DEGREE));
const line2 = new Line(Vector.createPosition(-0.5, 2), Vector.createDirection(1.5, -2));
const ray1 = new Ray(Vector.createPosition(1, 1), Vector.createDirection(1, 1));
const ray2 = new Ray(Vector.createPosition(-1, -2), Vector.createDirection(1, -2));
const segment1 = new Segment(Vector.createPosition(1, -2), Vector.createPosition(2, 0));
const segment2 = new Segment(Vector.createPosition(-1, 1), Vector.createPosition(1, -1));

line1.props = { strokeStyle: "blue", fillStyle: "blue" };
line2.props = { strokeStyle: "purple", fillStyle: "purple" };
ray1.props = { strokeStyle: "orange", fillStyle: "orange" };
ray2.props = { strokeStyle: "magenta", fillStyle: "magenta" };
segment1.props = { strokeStyle: "red", fillStyle: "red" };
segment2.props = { strokeStyle: "green", fillStyle: "green" };

const geometries: Geometry[] = [
  line1,
  line2,
  ray1,
  ray2,
  segment1,
  segment2,
];

// const scale = new NumberEaser(5, 40, duration, Ease.outCatmullRom2N1, v => graph.gridSize = v);
// const rotate = new NumberEaser(0, 360, duration * 5, Ease.smoothStep, v => angle = v);
const lineRotate = new NumberEaser(0, 360, duration / 360, Ease.smoothStep, _ => { }, () => {
  line1.direction.rotate(MathEx.ONE_DEGREE);
  line2.direction.rotate(-Math.random() * 2 * MathEx.ONE_DEGREE);
  ray1.direction.rotateOneDegree();
  ray2.direction.rotate(-Math.random() * 2 * MathEx.ONE_DEGREE);
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
  lineRotate.repeat(Infinity),
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
  renderIntersections(viewport);
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

  renderIntersection(segment2, line1, viewport);
}

function renderIntersection(a: Geometry, b: Geometry, viewport: Viewport) {
  const point = a.getIntersectionPoint(b);

  if (!point) return;

  beginPath(a.props, viewport);
  ctx.strokeCircle(point, 0.1);
}

function beginPath(props: ContextProps, viewport: Viewport) {
  ctx.beginPath().withProps(props).withLineWidth(getLineWidth(props, viewport));
}

function getLineWidth(props: ContextProps, viewport: Viewport) {
  return viewport.calcLineWidth(props.lineWidth !== undefined ? props.lineWidth : 1);
}
