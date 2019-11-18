import { AnimationLoop } from '../../../animation';
import { WebColors } from '../../../colors';
import { MathEx } from '../../../core';
import { Ease, EaseRunner, NumberEaser } from '../../../easing';
import { Brush, CanvasContext, ContextProps, Graph, Line, Viewport } from '../../../twod';
import { ShapePair, SimpleCollider } from '../../../twod/collision';
import { AABBShape, CircleShape, PlaneShape, PolygonShape, Shape, TriangleShape } from '../../../twod/shapes';
import { UiUtils } from '../../../utils';
import { UniqueVectorList, Vector } from '../../../vectors';

const { ONE_DEGREE } = MathEx;

// console.clear();

const canvasb = UiUtils.getCanvasElement("canvasb");
canvasb.width = 300;
canvasb.height = 300;
const ctxb = new CanvasContext(canvasb);

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
Vector.tipDrawHeight = 0.5;
const screenBounds = ctx.bounds;
const origin = Vector.createPosition(0, 0);
const gridSize = 15;
const radius = 2.5;
const smallRadius = 1.5;
let angle = 0;
const duration = 5;

const graph = new Graph(ctx.bounds, gridSize);
const collider = new SimpleCollider();
const vector1 = Vector.createDirection(1, 0);
// const point1 = Vector.createPosition(2, 0);
const circle1 = new CircleShape(smallRadius);
// circle1.setPosition(Vector.createPosition(2.5, 2.5));
circle1.setPosition(Vector.createPosition(2.5, 5.5));
// circle1.setPosition(Vector.createPosition(2.5, 3.5));
const circle2 = new CircleShape(radius);
circle2.setPosition(Vector.createPosition(2.5, 2.5));
const poly1 = new PolygonShape(5, radius, 90 * ONE_DEGREE);
let poly2: Shape;
let poly3: Shape;
let poly4: Shape;
const aabb1 = new AABBShape(Vector.createDirection(radius * 0.9, radius * 0.9));
const aabb2 = new AABBShape(Vector.createDirection(radius * 0.9, radius * 0.9));
const triangle1 = new TriangleShape(radius, 90 * ONE_DEGREE, true);
let triangle2: Shape;
const plane1 = new PlaneShape(Vector.createPosition(0, 2.5), Vector.createPosition(1, 2.5));

const vector1Props = { strokeStyle: colors[0], fillStyle: colors[0] };
// const point1Props = { strokeStyle: colors[0], fillStyle: colors[0] };

const vectors: [Vector, ContextProps][] = [
  // [vector1, vector1Props],
];

const pairs: ShapePair[] = [
  new ShapePair(circle1, circle2),
  // new ShapePair(circle2, circle1),
  // new ShapePair(circle1, plane1),
  // new ShapePair(plane1, circle1),
  // new ShapePair(aabb1, plane1),
  // new ShapePair(plane1, aabb1),
]

const points: [Vector, ContextProps][] = [
  // [point1, point1Props],
];

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

drawGraph();
loop.start();
runner.start();

function drawGraph() {
  ctxb.beginPath().withFillStyle("grey").fillRect(ctxb.bounds);

  ctxb
    .save()
    .translate(screenBounds.center)
    .rotateDegrees(angle)
    .translate(screenBounds.center.negateO());

  graph.render(ctxb);
  ctxb.restore();
}

function render() {
  loop.stop();
  ctx.beginPath().clearRect(ctx.bounds);

  ctx
    .save()
    .translate(screenBounds.center)
    .rotateDegrees(angle)
    .translate(screenBounds.center.negateO());

  const viewport = graph.getViewport(ctx);
  viewport.applyTransform();

  const { first, second } = pairs[0];
  first.props = { strokeStyle: colors[0] };
  second.props = { strokeStyle: refBrush, lineWidth: 2 };
  second.render(viewport);
  first.render(viewport);
  vectors.forEach(([vector, props]) => vector.render(viewport, origin, props));
  points.forEach(([point, props]) => point.render(viewport, origin, props));

  const contact = collider.calcContact(pairs[0]);

  if (contact) {
    contact.render(viewport);
  }

  drawSat(pairs[0], viewport);
  viewport.restoreTransform();
  ctx.restore();
}

function addDynamicTesters() {
  // testers.remove(poly2);
  // testers.remove(poly3);
  // testers.remove(poly4);
  // testers.remove(triangle2);
  // shapes.remove(poly2);
  // shapes.remove(poly3);
  // shapes.remove(poly4);
  // shapes.remove(triangle2);

  // poly2 = new PolygonShape(5, 0.5, 0, false);
  // poly2.setPosition(Vector.createPosition(0.5, 2));
  // poly3 = new PolygonShape(15, 0.5, 0, false);
  // poly3.setPosition(Vector.createPosition(-0.5, 2));
  // poly4 = new PolygonShape(15, 0.5, 0, false);
  // poly4.setPosition(Vector.createPosition(-1.5, 1.5));
  // triangle2 = new TriangleShape(0.5, 0, false);
  // triangle2.setPosition(Vector.createPosition(-0.5, -1.5));

  // poly2.props = { strokeStyle: refBrush };
  // poly3.props = { strokeStyle: refBrush };
  // poly4.props = { strokeStyle: refBrush };
  // triangle2.props = { strokeStyle: refBrush };

  // testers.push(poly2);
  // testers.push(poly3);
  // testers.push(poly4);
  // testers.push(triangle2);
  // shapes.unshift(poly2);
  // shapes.unshift(poly3);
  // shapes.unshift(poly4);
  // shapes.unshift(triangle2);
}

function beginPath(props: ContextProps, viewport: Viewport) {
  ctx.beginPath().withProps(props).withLineWidth(getLineWidth(props, viewport));
}

function getLineWidth(props: ContextProps, viewport: Viewport) {
  return viewport.calcLineWidth(props.lineWidth !== undefined ? props.lineWidth : 1);
}

function drawProjection(shape: Shape, axis: Vector, axisLine: Line, view: Viewport, offset: number = 0) {
  let support1 = shape.getSupportPoint(axis);
  let support2 = shape.getSupportPoint(axis.negateO());

  if (!support1 || !support2) return;

  shape.toWorld(support1, support1);
  shape.toWorld(support2, support2);
  const ofs = axis.perpLeftO().scale(offset);
  const closest1 = axisLine.closestPoint(support1).displaceBy(ofs);
  const closest2 = axisLine.closestPoint(support2).displaceBy(ofs);

  const props: ContextProps = {};
  Object.assign(props, shape.props);
  props.lineDash = [0.2, 0.2];

  const ctx = view.ctx;
  beginPath(props, view);
  ctx.line(support1, closest1).stroke();
  ctx.line(support2, closest2).stroke();

  props.lineDash = [];
  props.lineWidth = 3;

  beginPath(props, view);
  ctx.line(closest1, closest2).stroke();
}

function createAxisLine(axis: Vector, radius: number) {
  const props: ContextProps = { strokeStyle: "black", lineDash: [0.3, 0.3], lineWidth: 2 };
  const origin = Vector.createPosition(0, 0);
  const dir = axis.perpRightO().scale(radius);
  const line = new Line(origin, origin.displaceByO(axis));
  line.setPosition(dir.asPosition());
  line.props = props;
  return line;
}

function drawSat(shapes: ShapePair, view: Viewport) {
  const { first, second } = shapes;
  const axesA = first.getAxes();
  const axesB = second.getAxes();
  const axesList = new UniqueVectorList(true);
  axesList.addVectors(axesA.map(a => first.toWorld(a)));
  axesList.addVectors(axesB.map(a => second.toWorld(a)));

  if (first.hasDynamicAxes)
    axesList.addVectors(first.getDynamicAxes(second));

  if (second.hasDynamicAxes)
    axesList.addVectors(second.getDynamicAxes(first));

  const axes = axesList.items;
  // console.log(`axes count: ${axes.length}`);
  const radius = view.viewBounds.halfSize.x * 0.9;
  const axesLines = axes.map(a => createAxisLine(a, radius));

  // const ctx = view.ctx;
  // const props: ContextProps = { strokeStyle: "black", lineDash: [0.2, 0.2] };
  // beginPath(props, view);
  // ctx.strokeCircle(0, 0, radius);
  axesLines.forEach(a => a.render(view));

  axes.forEach((a, i) => {
    drawProjection(first, a, axesLines[i], view);
    drawProjection(second, a, axesLines[i], view, 0.5);
  });
}
