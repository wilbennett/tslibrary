import { AnimationLoop } from '../../../animation';
import { WebColors } from '../../../colors';
import { MathEx } from '../../../core';
import { Ease, EaseRunner, NumberEaser } from '../../../easing';
import { Brush, CanvasContext, ContextProps, Graph } from '../../../twod';
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

const refBrush = "teal";
Vector.tipDrawHeight = 0.1;
const screenBounds = ctx.bounds;
const origin = Vector.createPosition(0, 0);
const gridSize = 50;
let angle = 0;
const duration = 5;

const graph = new Graph(ctx.bounds, gridSize);
const vector1 = Vector.createDirection(1, 0);
// const point1 = Vector.createPosition(2, 0);
const circle = new CircleShape(0.5);
circle.setPosition(Vector.createPosition(2, 0.5));
const poly1 = new PolygonShape(5, 0.5, 90 * ONE_DEGREE);
poly1.setPosition(Vector.createPosition(1.5, 1.5));
const poly2 = new PolygonShape(5, 0.5, 0, false);
poly2.setPosition(Vector.createPosition(0.5, 2));
const poly3 = new PolygonShape(10, 0.5, 0, false);
poly3.setPosition(Vector.createPosition(-0.5, 2));
const poly4 = new PolygonShape(15, 0.5, 0, false);
poly4.setPosition(Vector.createPosition(-1.5, 1.5));

const vector1Props = { strokeStyle: colors[0], fillStyle: colors[0] };
// const point1Props = { strokeStyle: colors[0], fillStyle: colors[0] };

circle.props = { strokeStyle: refBrush };
poly1.props = { strokeStyle: refBrush };
poly2.props = { strokeStyle: refBrush };
poly3.props = { strokeStyle: refBrush };
poly4.props = { strokeStyle: refBrush };

const vectors: [Vector, ContextProps][] = [
  [vector1, vector1Props],
];

const points: [Vector, ContextProps][] = [
  // [point1, point1Props],
];

const testers: Shape[] = [
  circle,
  poly1,
  poly2,
  poly3,
  poly4,
];

const controls: Shape[] = [
];

const shapes: Shape[] = [...testers, ...controls];

const fps = 60;
const secPerFrame = 1 / fps;
const framesPerDegree = 2;
const secPerDegree = framesPerDegree * secPerFrame;

const vector1Rotate = new NumberEaser(0, 360, 360 * secPerDegree, Ease.linear, v => {
  vector1.withRadiansMag(v * ONE_DEGREE, vector1.mag);
});

// const point1Rotate = new NumberEaser(0, 90, duration * 1, Ease.smoothStep, v => {
//   point1.withRadiansMag(v * ONE_DEGREE, point1.mag);
// });

// const rotateShapes = new NumberEaser(0, 360, duration * 1.5, Ease.inOutBack, v => {
//   shapes.forEach(shape => shape.angle = v * ONE_DEGREE);
// });

const loop = new AnimationLoop(undefined, render);
const runner = new EaseRunner();
runner.add(
  vector1Rotate.repeat(Infinity),
  // point1Rotate.pingPong().repeat(Infinity),
  // rotateShapes.repeat(Infinity),
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
  points.forEach(([point, props]) => point.render(viewport, origin, props));

  viewport.restoreTransform();
  ctx.restore();
}

// function renderPointContainments(viewport: Viewport) {
//   for (var [point, props] of points) {
//     for (var tester of testers) {
//       renderPointContainment(tester, point, props, viewport);
//     }
//   }
// }

// function renderPointContainment(a: Shape, point: Vector, props: ContextProps, viewport: Viewport) {
//   if (!a.containsPoint(a.toLocal(point), 0.05)) return;

//   beginPath(props, viewport);
//   viewport.ctx.fillStyle = props.fillStyle || props.strokeStyle || "gray";
//   ctx.fillCircle(point, 0.1);
// }

// function beginPath(props: ContextProps, viewport: Viewport) {
//   ctx.beginPath().withProps(props).withLineWidth(getLineWidth(props, viewport));
// }

// function getLineWidth(props: ContextProps, viewport: Viewport) {
//   return viewport.calcLineWidth(props.lineWidth !== undefined ? props.lineWidth : 1);
// }
