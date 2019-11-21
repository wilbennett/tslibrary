import { AnimationLoop } from '../../../animation';
import { WebColors } from '../../../colors';
import { MathEx } from '../../../core';
import { EaseRunner } from '../../../easing';
import { Brush, CanvasContext, ContextProps, Graph, Line, Viewport } from '../../../twod';
import { ShapePair } from '../../../twod/collision';
import { PolygonShape, Shape, ShapeAxis, UniqueShapeAxesList } from '../../../twod/shapes';
import * as Minkowski from '../../../twod/shapes/minkowski';
import { UiUtils } from '../../../utils';
import { Vector } from '../../../vectors';

// const { ONE_DEGREE } = MathEx;

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
// const origin = Vector.createPosition(0, 0);
const gridSize = 20;
let angle = 0;
// const duration = 5;

const graph = new Graph(ctx.bounds, gridSize);
const poly1 = new PolygonShape([pos(4, 5), pos(9, 9), pos(4, 11)]);
const poly2 = new PolygonShape([pos(7, 3), pos(10, 2), pos(12, 7), pos(5, 7)]);

const pairs: ShapePair[] = [
  new ShapePair(poly1, poly2),
  new ShapePair(poly2, poly1),
]

// pairs[0].second.setPosition(Vector.createPosition(2.5, 2.5));

// pairs[0].first.setPosition(Vector.createPosition(2.5, 2.5));
// pairs[0].first.setPosition(Vector.createPosition(2.5, 5.5));
// pairs[0].first.setPosition(Vector.createPosition(2.5, 3.5));
// pairs[0].first.setPosition(Vector.createPosition(1.5, 4.5));
// pairs[0].first.setPosition(Vector.createPosition(1.5, 0.5));
// pairs[0].first.setPosition(Vector.createPosition(4.0, 0.5));
// pairs[0].first.setPosition(Vector.createPosition(5.0, 0.5));
// pairs[0].first.setPosition(Vector.createPosition(-0.6, 0.5));

// const fps = 60;
// const secPerFrame = 1 / fps;
// const framesPerDegree = 4;
// const secPerDegree = framesPerDegree * secPerFrame;

const loop = new AnimationLoop(undefined, render);
const runner = new EaseRunner();
runner.add(
  // vector1Rotate.repeat(Infinity),
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

  const pair = pairs[0];
  const { first, second } = pair;
  const lineW = 1;
  first.props = { strokeStyle: colors[0], lineWidth: lineW };
  second.props = { strokeStyle: refBrush, lineWidth: lineW };
  second.render(viewport);
  first.render(viewport);
  drawShape1Vertices(first, viewport);
  drawShape2Vertices(second, viewport);
  drawMinkowskiVertices(pair, viewport);

  // drawSat(pair, viewport);
  viewport.restoreTransform();
  ctx.restore();
}

function pos(x: number, y: number) { return Vector.createPosition(x, y); }

function getLineWidth(props: ContextProps, viewport: Viewport) {
  return viewport.calcLineWidth(props.lineWidth !== undefined ? props.lineWidth : 1);
}

function beginPath(props: ContextProps, view: Viewport) {
  view.ctx.beginPath().withGlobalAlpha(1).withProps(props).withLineWidth(getLineWidth(props, view));
  return view.ctx;
}

function drawVertices(shape: Shape, props: ContextProps, view: Viewport) {
  const vertices = shape.vertexList.items;
  const vertexCount = vertices.length;
  const vertex = Vector.create();
  const stroke = props.strokeStyle;
  const fill = props.fillStyle;

  for (let i = 0; i < vertexCount; i++) {
    beginPath(props, view)
      .withStrokeStyle((stroke && colors[i]) || "transparent")
      .withFillStyle((fill && colors[i]) || "transparent")
      .circle(shape.toWorld(vertices[i], vertex), 0.3)
      .fill()
      .stroke();
  }
}

function drawShape1Vertices(shape: Shape, view: Viewport) {
  const props: ContextProps = { fillStyle: "black", lineWidth: 2 };
  drawVertices(shape, props, view);
}

function drawShape2Vertices(shape: Shape, view: Viewport) {
  const props: ContextProps = { strokeStyle: "black", lineWidth: 2 };
  drawVertices(shape, props, view);
}

function drawMinkowskiVertices(shapes: ShapePair, view: Viewport) {
  const { first, second } = shapes;

  let msPoints = Minkowski.createDiff(first, second);

  if (!msPoints) return;

  const props: ContextProps = { lineWidth: 2 };
  const count = msPoints.length;

  for (let i = 0; i < count; i++) {
    const mp = msPoints[i];

    beginPath(props, view)
      .withFillStyle(colors[mp.indexA])
      .withGlobalAlpha(mp.isInteriorPoint ? 0.25 : 1)
      .fillCircle(mp.point, 0.3);

    beginPath(props, view)
      .withStrokeStyle(colors[mp.indexB])
      .withGlobalAlpha(mp.isInteriorPoint ? 0.25 : 1)
      .strokeCircle(mp.point, 0.5);
  }

  beginPath(props, view)
    .withStrokeStyle("rebeccapurple")
    .withGlobalAlpha(1)
    .poly(msPoints.map(mp => mp.point), true)
    .stroke();
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
  const origin = Vector.createPosition(0, 0);
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
