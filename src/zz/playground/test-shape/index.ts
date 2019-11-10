import { AnimationLoop } from '../../../animation';
import { WebColors } from '../../../colors';
import { MathEx } from '../../../core';
import { Ease, EaseRunner, NumberEaser } from '../../../easing';
import { Brush, CanvasContext, ContextProps, Graph, Viewport } from '../../../twod';
import { CircleShape, PolygonShape, Shape } from '../../../twod/shapes';
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

const screenBounds = ctx.bounds;
const origin = Vector.createPosition(0, 0);
const gridSize = 50;
let angle = 0;
const duration = 5;
Vector.tipDrawHeight = 0.2;

const graph = new Graph(ctx.bounds, gridSize);
const vector1 = Vector.createPosition(2, 0);
const circle = new CircleShape(0.5);
circle.setPosition(Vector.createPosition(2, 0.5));
const poly1 = new PolygonShape(5, 0.5, 90 * ONE_DEGREE);
poly1.setPosition(Vector.createPosition(1.5, 1.5));
const poly2 = new PolygonShape(5, 0.5, 0, false);
poly2.setPosition(Vector.createPosition(0.5, 2));

const vector1Props = { strokeStyle: "black", fillStyle: "black" };
circle.props = { strokeStyle: colors[0] };
poly1.props = { strokeStyle: colors[1] };
poly2.props = { strokeStyle: colors[2] };

const vectors: [Vector, ContextProps][] = [
  [vector1, vector1Props],
];

const shapes: Shape[] = [
  circle,
  poly1,
  poly2,
];

const rotateV1 = new NumberEaser(0, 90, duration * 1, Ease.smoothStep, v => {
  vector1.withRadiansMag(v * ONE_DEGREE, vector1.mag);
});

const rotateShape = new NumberEaser(0, 360, duration * 1.5, Ease.inOutBack, v => {
  shapes.forEach(shape => shape.angle = v * ONE_DEGREE);
});

const loop = new AnimationLoop(undefined, render);
const runner = new EaseRunner();
runner.add(
  rotateV1.pingPong().repeat(Infinity),
  rotateShape.repeat(Infinity),
);

loop.start();
runner.start();

function render() {
  // loop.stop();
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
  renderPointContainment(poly1, vector1, viewport);
  renderPointContainment(poly2, vector1, viewport);
}

function renderPointContainment(a: Shape, point: Vector, viewport: Viewport) {
  const localPoint = a.toLocal(point);
  if (!a.containsPoint(localPoint)) return;

  beginPath(a.props, viewport);
  viewport.ctx.fillStyle = a.props.fillStyle || a.props.strokeStyle || "gray";
  ctx.fillCircle(point, 0.1);
}

function beginPath(props: ContextProps, viewport: Viewport) {
  ctx.beginPath().withProps(props).withLineWidth(getLineWidth(props, viewport));
}

function getLineWidth(props: ContextProps, viewport: Viewport) {
  return viewport.calcLineWidth(props.lineWidth !== undefined ? props.lineWidth : 1);
}
