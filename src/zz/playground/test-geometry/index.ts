import { AnimationLoop } from '../../../animation';
import { WebColors } from '../../../colors';
import { MathEx } from '../../../core';
import { Ease, EaseRunner, NumberEaser } from '../../../easing';
import { CanvasContext, ContextProps, Graph, Line, Ray, Segment, Viewport } from '../../../twod';
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
const ray2 = new Ray(Vector.createPosition(-2, -1), Vector.createDirection(1, -2));
const segment1 = new Segment(Vector.createPosition(-1, 1), Vector.createPosition(1, -1));
const segment2 = new Segment(Vector.createPosition(1, -2), Vector.createPosition(2, 0));

const line1Props: ContextProps = { strokeStyle: "blue" };
const line2Props: ContextProps = { strokeStyle: "purple" };
const ray1Props: ContextProps = { strokeStyle: "orange" };
const ray2Props: ContextProps = { strokeStyle: "magenta" };
const segment1Props: ContextProps = { strokeStyle: "red" };
const segment2Props: ContextProps = { strokeStyle: "green" };

// const scale = new NumberEaser(5, 40, duration, Ease.outCatmullRom2N1, v => graph.gridSize = v);
// const rotate = new NumberEaser(0, 360, duration * 5, Ease.smoothStep, v => angle = v);
const lineRotate = new NumberEaser(0, 360, duration / 360, Ease.smoothStep, _ => { }, () => {
  line1.direction.rotateOneDegree();
  line2.direction.rotateNegativeOneDegree();
  ray1.direction.rotateOneDegree();
  ray2.direction.rotateNegativeOneDegree();
});

const loop = new AnimationLoop(undefined, render);
const runner = new EaseRunner();
runner.add(
  // scale.pingPong().repeat(Infinity),
  // rotate.pingPong().repeat(Infinity),
  lineRotate.repeat(Infinity),
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
  line1.render(viewport, line1Props);
  line2.render(viewport, line2Props);
  ray1.render(viewport, ray1Props);
  ray2.render(viewport, ray2Props);
  segment1.render(viewport, segment1Props);
  segment2.render(viewport, segment2Props);

  renderIntersections(viewport);
  viewport.restoreTransform();

  ctx.restore();
}

function renderIntersections(viewport: Viewport) {
  renderLineIntersection(viewport);
  renderRayIntersection(viewport);
}

function renderLineIntersection(viewport: Viewport) {
  const point = line1.getLineIntersectionPoint(line2);

  if (!point) return;

  beginPath(line1Props, viewport);
  ctx.strokeCircle(point, 0.1);
}

function renderRayIntersection(viewport: Viewport) {
  const point = ray1.getRayIntersectionPoint(ray2);

  if (!point) return;

  beginPath(ray1Props, viewport);
  ctx.strokeCircle(point, 0.1);
}

function beginPath(props: ContextProps, viewport: Viewport) {
  ctx.beginPath().withProps(props).withLineWidth(getLineWidth(props, viewport));
}

function getLineWidth(props: ContextProps, viewport: Viewport) {
  return viewport.calcLineWidth(props.lineWidth !== undefined ? props.lineWidth : 1);
}
