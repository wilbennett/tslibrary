import { AnimationLoop } from '../../../animation';
import { WebColors } from '../../../colors';
import { MathEx } from '../../../core';
import { Ease, EaseRunner, NumberEaser } from '../../../easing';
import { Brush, CanvasContext, ContextProps, Graph, Viewport } from '../../../twod';
import { AABBShape, CircleShape, PolygonShape, Shape, TriangleShape } from '../../../twod/shapes';
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
let poly2: Shape;
let poly3: Shape;
let poly4: Shape;
const aabb1 = new AABBShape(Vector.createDirection(0.4, 0.4));
aabb1.setPosition(Vector.createPosition(-2, 0.5));
const triangle1 = new TriangleShape(0.5, 90 * ONE_DEGREE, true);
triangle1.setPosition(Vector.createPosition(-1.5, -0.5));
let triangle2: Shape;

const vector1Props = { strokeStyle: colors[0], fillStyle: colors[0] };
// const point1Props = { strokeStyle: colors[0], fillStyle: colors[0] };

circle.props = { strokeStyle: refBrush };
poly1.props = { strokeStyle: refBrush };
aabb1.props = { strokeStyle: refBrush };
triangle1.props = { strokeStyle: refBrush };

const vectors: [Vector, ContextProps][] = [
  [vector1, vector1Props],
];

const points: [Vector, ContextProps][] = [
  // [point1, point1Props],
];

const testers: Shape[] = [
  circle,
  poly1,
  aabb1,
  triangle1,
];

const controls: Shape[] = [
];

const shapes: Shape[] = [...testers, ...controls];

addDynamicTesters();

const fps = 60;
const secPerFrame = 1 / fps;
const framesPerDegree = 4;
const secPerDegree = framesPerDegree * secPerFrame;

const vector1Rotate = new NumberEaser(0, 360, 360 * secPerDegree, Ease.linear, v => {
  vector1.withRadiansMag(v * ONE_DEGREE, vector1.mag);
}, () => addDynamicTesters());

// const point1Rotate = new NumberEaser(0, 90, duration * 1, Ease.smoothStep, v => {
//   point1.withRadiansMag(v * ONE_DEGREE, point1.mag);
// });

const rotateShapes = new NumberEaser(0, 360, duration * 1.5, Ease.inOutBack, v => {
  shapes.forEach(shape => shape.angle = v * ONE_DEGREE);
});

const loop = new AnimationLoop(undefined, render);
const runner = new EaseRunner();
runner.add(
  vector1Rotate.repeat(Infinity),
  // point1Rotate.pingPong().repeat(Infinity),
  rotateShapes.repeat(Infinity),
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
  renderSupports(viewport);

  viewport.restoreTransform();
  ctx.restore();
}

function addDynamicTesters() {
  testers.remove(poly2);
  testers.remove(poly3);
  testers.remove(poly4);
  testers.remove(triangle2);
  shapes.remove(poly2);
  shapes.remove(poly3);
  shapes.remove(poly4);
  shapes.remove(triangle2);

  poly2 = new PolygonShape(5, 0.5, 0, false);
  poly2.setPosition(Vector.createPosition(0.5, 2));
  poly3 = new PolygonShape(15, 0.5, 0, false);
  poly3.setPosition(Vector.createPosition(-0.5, 2));
  poly4 = new PolygonShape(15, 0.5, 0, false);
  poly4.setPosition(Vector.createPosition(-1.5, 1.5));
  triangle2 = new TriangleShape(0.5, 0, false);
  triangle2.setPosition(Vector.createPosition(-0.5, -1.5));

  poly2.props = { strokeStyle: refBrush };
  poly3.props = { strokeStyle: refBrush };
  poly4.props = { strokeStyle: refBrush };
  triangle2.props = { strokeStyle: refBrush };

  testers.push(poly2);
  testers.push(poly3);
  testers.push(poly4);
  testers.push(triangle2);
  shapes.unshift(poly2);
  shapes.unshift(poly3);
  shapes.unshift(poly4);
  shapes.unshift(triangle2);
}

function renderSupports(viewport: Viewport) {
  for (var [vector, props] of vectors) {
    for (var tester of testers) {
      renderSupport(tester, vector, props, viewport);
    }
  }
}

function renderSupport(a: Shape, direction: Vector, props: ContextProps, viewport: Viewport) {
  const localDir = a.toLocal(direction);
  const point = Vector.create(0, 0);

  if (!a.getSupportPoint(localDir, point)) return;

  beginPath(props, viewport);
  viewport.ctx.fillStyle = props.fillStyle || props.strokeStyle || "gray";
  ctx.fillCircle(a.toWorld(point, point), 0.06);
}

function beginPath(props: ContextProps, viewport: Viewport) {
  ctx.beginPath().withProps(props).withLineWidth(getLineWidth(props, viewport));
}

function getLineWidth(props: ContextProps, viewport: Viewport) {
  return viewport.calcLineWidth(props.lineWidth !== undefined ? props.lineWidth : 1);
}
