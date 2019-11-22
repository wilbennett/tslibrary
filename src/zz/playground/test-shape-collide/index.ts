import { AnimationLoop } from '../../../animation';
import { WebColors } from '../../../colors';
import { MathEx } from '../../../core';
import { Ease, EaseRunner, NumberEaser } from '../../../easing';
import { Brush, CanvasContext, ContextProps, Graph, Line, Viewport } from '../../../twod';
import { Collider, SATProjection, SATSupport, ShapePair, SimpleCollider } from '../../../twod/collision';
import {
  AABBShape,
  CircleShape,
  PlaneShape,
  PolygonShape,
  Shape,
  ShapeAxis,
  TriangleShape,
  UniqueShapeAxesList,
} from '../../../twod/shapes';
import { UiUtils } from '../../../utils';
import { Vector } from '../../../vectors';

const { ONE_DEGREE } = MathEx;

// console.clear();

const gridExtent = 600;
const canvasb = UiUtils.getCanvasElement("canvasb");
canvasb.width = gridExtent;
canvasb.height = gridExtent;
const ctxb = new CanvasContext(canvasb);

const canvas = UiUtils.getCanvasElement("canvas");
canvas.width = gridExtent;
canvas.height = gridExtent;
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
MathEx.epsilon = 0.0001;
Vector.tipDrawHeight = 0.5;
const screenBounds = ctx.bounds;
const origin = Vector.position(0, 0);
const gridSize = 30;
const radius = 2.5;
const smallRadius = 1.5;
let angle = 0;
// const duration = 5;

const graph = new Graph(ctx.bounds, gridSize);
let collider: Collider;
collider = new SimpleCollider();
collider = new SATProjection();
collider = new SATSupport();
const collider2 = new SATProjection();
const vector1 = Vector.direction(1, 0);
// const point1 = Vector.createPosition(2, 0);
const circle1 = new CircleShape(smallRadius);
const circle2 = new CircleShape(radius);
const poly1 = new PolygonShape(5, smallRadius, 90 * ONE_DEGREE);
const poly2 = new PolygonShape(5, radius, 90 * ONE_DEGREE);
let poly3 = new PolygonShape(10, radius, 0, false);
let poly4 = new PolygonShape(10, radius, 0, false);
const aabb1 = new AABBShape(Vector.direction(smallRadius, smallRadius));
const aabb2 = new AABBShape(Vector.direction(radius * 0.9, radius * 0.9));
const triangle1 = new TriangleShape(smallRadius, 90 * ONE_DEGREE, true);
const triangle2 = new TriangleShape(radius, 90 * ONE_DEGREE, true);
const plane1 = new PlaneShape(Vector.position(0, 2.5), Vector.position(1, 3.5));

// const vector1Props = { strokeStyle: colors[0], fillStyle: colors[0] };
// const point1Props = { strokeStyle: colors[0], fillStyle: colors[0] };

const vectors: [Vector, ContextProps][] = [
  // [vector1, vector1Props],
];

const pairs: ShapePair[] = [
  new ShapePair(circle1, aabb2),
  new ShapePair(aabb2, circle1),
  new ShapePair(circle1, circle2),
  new ShapePair(circle2, circle1),
  new ShapePair(poly3, poly4),
  new ShapePair(poly4, poly3),
  new ShapePair(poly1, poly2),
  new ShapePair(poly2, poly1),
  new ShapePair(triangle1, triangle2),
  new ShapePair(triangle2, triangle1),
  new ShapePair(circle1, plane1),
  new ShapePair(plane1, circle1),
  new ShapePair(aabb1, aabb2),
  new ShapePair(aabb2, aabb1),
  new ShapePair(aabb1, plane1),
  new ShapePair(plane1, aabb1),
]

pairs[0].second.setPosition(Vector.position(2.5, 2.5));

pairs[0].first.setPosition(Vector.position(2.5, 2.5));
pairs[0].first.setPosition(Vector.position(2.5, 5.5));
pairs[0].first.setPosition(Vector.position(2.5, 3.5));
pairs[0].first.setPosition(Vector.position(1.5, 4.5));
pairs[0].first.setPosition(Vector.position(1.5, 0.5));
// pairs[0].first.setPosition(Vector.createPosition(4.0, 0.5));
// pairs[0].first.setPosition(Vector.createPosition(5.0, 0.5));
// pairs[0].first.setPosition(Vector.createPosition(-0.6, 0.5));

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
  const lineW = collider.isColliding(pairs[0]) ? 4 : 2;
  first.props = { strokeStyle: colors[0], lineWidth: lineW };
  second.props = { strokeStyle: refBrush, lineWidth: lineW };
  second.render(viewport);
  first.render(viewport);
  vectors.forEach(([vector, props]) => vector.render(viewport, origin, props));
  points.forEach(([point, props]) => point.render(viewport, origin, props));

  let contact = collider2.calcContact(pairs[0]);

  if (contact) {
    contact.props = { strokeStyle: "green", fillStyle: "green" };
    contact.render(viewport);
  }

  contact = collider.calcContact(pairs[0]);

  if (contact) {
    contact.props = { strokeStyle: "blue", fillStyle: "blue" };
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
  ctx.beginPath().withGlobalAlpha(1).withProps(props).withLineWidth(getLineWidth(props, viewport));
}

function getLineWidth(props: ContextProps, viewport: Viewport) {
  return viewport.calcLineWidth(props.lineWidth !== undefined ? props.lineWidth : 1);
}

function drawShapeProjection(shape: Shape, axis: ShapeAxis, axisLine: Line, view: Viewport, offset: number = 0) {
  const projection = shape.projectOn(axis.worldNormal);

  if (!projection) return;

  const minPoint = projection.minPoint;
  const maxPoint = projection.maxPoint;

  const ofs = axis.worldNormal.perpLeftO().scale(offset);
  const minClosest = axisLine.closestPoint(minPoint).displaceBy(ofs);
  const maxClosest = axisLine.closestPoint(maxPoint).displaceBy(ofs);

  const ctx = view.ctx;
  const props: ContextProps = {};
  Object.assign(props, shape.props);

  props.lineDash = [];
  props.lineWidth = 3;
  beginPath(props, view);
  ctx.line(minClosest, maxClosest).stroke();

  props.lineDash = [0.2, 0.2];
  props.globalAlpha = 0.2;
  beginPath(props, view);
  ctx.line(minPoint, minClosest).stroke();
  ctx.line(maxPoint, maxClosest).stroke();
}

function drawProjection(pair: ShapePair, axis: ShapeAxis, axisLine: Line, view: Viewport) {
  const { first, second } = pair;
  drawShapeProjection(first, axis, axisLine, view, 0.5);
  drawShapeProjection(second, axis, axisLine, view);
}

function createAxisLine(axis: ShapeAxis, radius: number) {
  const props: ContextProps = { strokeStyle: "black", lineDash: [0.5, 0.5], lineWidth: 2, globalAlpha: 0.5 };
  const origin = Vector.position(0, 0);
  const dir = axis.worldNormal.perpRightO().scale(radius);
  const line = new Line(origin, origin.displaceByO(axis.worldNormal));
  line.setPosition(dir.asPosition());
  line.props = props;
  return line;
}

function drawSat(shapes: ShapePair, view: Viewport) {
  const { first, second } = shapes;
  const axesList = new UniqueShapeAxesList(true);

  axesList.addAxes([
    ...first.getAxes(),
    ...second.getAxes(),
    ...first.getDynamicAxes(second),
    ...second.getDynamicAxes(first),
  ]);

  const axes = axesList.items;
  // console.log(`axes count: ${axes.length}`);
  // console.log(`axes: ${axes.map(a => a.worldNormal.toString())}`);
  const radius = view.viewBounds.halfSize.x * 0.8;
  const axesLines = axes.map(a => createAxisLine(a, radius));

  // const ctx = view.ctx;
  // const props: ContextProps = { strokeStyle: "black", lineDash: [0.2, 0.2] };
  // beginPath(props, view);
  // ctx.strokeCircle(0, 0, radius);
  axesLines.forEach(a => a.render(view));
  axes.forEach((a, i) => drawProjection(shapes, a, axesLines[i], view));
}
