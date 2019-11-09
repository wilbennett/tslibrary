import { AnimationLoop } from '../../../animation';
import { WebColors } from '../../../colors';
import { MathEx } from '../../../core';
import { Ease, EaseRunner, NumberEaser } from '../../../easing';
import { CanvasContext, ContextProps, Geometry, Graph, Viewport } from '../../../twod';
import { CircleShape, Shape } from '../../../twod/shapes';
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

const screenBounds = ctx.bounds;
const origin = Vector.createPosition(0, 0);
const gridSize = 50;
let angle = 0;
const duration = 5;
Vector.tipDrawHeight = 0.2;

const graph = new Graph(ctx.bounds, gridSize);
const vector1 = Vector.createPosition(2, 0);
const circle = new CircleShape(0.5);
circle.setPosition(Vector.createPosition(1.5, 1.5));

const vector1Props = { strokeStyle: "black", fillStyle: "black" };
circle.props = { strokeStyle: "red" };

const vectors: [Vector, ContextProps][] = [
  [vector1, vector1Props],
];

const shapes: Shape[] = [
  circle,
];

const rotateV1 = new NumberEaser(0, 360, duration * 1, Ease.smootherStep, v => {
  vector1.withRadiansMag(v * ONE_DEGREE, vector1.mag);
});

const rotateShape = new NumberEaser(0, 360, duration * 1, Ease.smootherStep, v => {
  shapes.forEach(shape => shape.angle = v * ONE_DEGREE);
});

const loop = new AnimationLoop(undefined, render);
const runner = new EaseRunner();
runner.add(
  rotateV1.repeat(Infinity),
  rotateShape.repeat(Infinity),
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

  shapes.forEach(shape => shape.render(viewport));
  vectors.forEach(([vector, props]) => vector.render(viewport, origin, props));
  renderPointContainments(viewport);
  viewport.restoreTransform();

  ctx.restore();
}

function renderPointContainments(viewport: Viewport) {
  renderPointContainment(circle, vector1, viewport);
}

function renderPointContainment(a: Geometry, point: Vector, viewport: Viewport) {
  if (!a.containsPoint(point)) return;

  beginPath(a.props, viewport);
  viewport.ctx.fillStyle = a.props.fillStyle || a.props.strokeStyle || "gray";
  ctx.fillCircle(point, 0.2);
}

function beginPath(props: ContextProps, viewport: Viewport) {
  ctx.beginPath().withProps(props).withLineWidth(getLineWidth(props, viewport));
}

function getLineWidth(props: ContextProps, viewport: Viewport) {
  return viewport.calcLineWidth(props.lineWidth !== undefined ? props.lineWidth : 1);
}
