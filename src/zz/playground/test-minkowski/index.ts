import { AnimationLoop } from '../../../animation';
import { WebColors } from '../../../colors';
import { MathEx, Tristate } from '../../../core';
import { ArrayEaser, ConcurrentEaser, DelayEaser, Ease, Easer, EaseRunner, SequentialEaser } from '../../../easing';
import { Brush, CanvasContext, ContextProps, Graph, Viewport } from '../../../twod';
import { ShapePair } from '../../../twod/collision';
import { CircleShape, MinkowskiPoint, PolygonShape, Shape } from '../../../twod/shapes';
import * as Minkowski from '../../../twod/shapes/minkowski';
import { setCircleSegmentCount } from '../../../twod/utils/utils2d';
import { UiUtils } from '../../../utils';
import { dir, pos, Vector } from '../../../vectors';

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

const elPause = UiUtils.getInputElement("pause");
// const elText = UiUtils.getInputElement("text");

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
// const origin = pos(0, 0);
const gridSize = 20;
let angle = 0;
// const duration = 5;
let isDirty = true;
// let showStates = true;
let showStates = false;
setCircleSegmentCount(showStates ? 10 : 30);

const graph = new Graph(ctx.bounds, gridSize);
const poly1 = new PolygonShape([pos(4, 5), pos(9, 9), pos(4, 11)]);
const poly2 = new PolygonShape([pos(7, 3), pos(10, 2), pos(12, 7), pos(5, 7)]);
const poly3 = new PolygonShape(5, 2, 0 * Math.PI / 180);
poly3.setPosition(pos(3.0, 3.0));
const poly4 = new PolygonShape(5, 2, 90 * Math.PI / 180);
poly4.setPosition(pos(7.0, 6.0));
const circle1 = new CircleShape(2);
circle1.setPosition(pos(3.0, 3.0));
const circle2 = new CircleShape(3);
circle2.setPosition(pos(9.0, 6.0));

const pairs: ShapePair[] = [
  new ShapePair(circle1, circle2),
  new ShapePair(poly1, circle2),
  new ShapePair(circle2, circle1),
  new ShapePair(circle1, poly2),
  new ShapePair(circle1, poly4),
  new ShapePair(poly3, poly4),
  new ShapePair(poly3, poly2),
  new ShapePair(poly2, poly3),
  new ShapePair(poly1, poly2),
  new ShapePair(poly2, poly1),
]

let pairIndex = -1;
let pair: ShapePair | null = null;
let polys: Tristate<Shape> = null;
let polyd: Tristate<Shape> = null;
let polydBrush = "green";
let sumStates: Minkowski.MinkowskiPointsState[] = [];
let diffStates: Minkowski.MinkowskiPointsState[] = [];
let sumState: Minkowski.MinkowskiPointsState | null = null;
let diffState: Minkowski.MinkowskiPointsState | null = null;
let stateAnim: Easer | null = null;

const delay = new DelayEaser(5);

// pairs[0].second.setPosition(pos(2.5, 2.5));

// pairs[0].first.setPosition(pos(2.5, 2.5));
// pairs[0].first.setPosition(pos(2.5, 5.5));
// pairs[0].first.setPosition(pos(2.5, 3.5));
// pairs[0].first.setPosition(pos(1.5, 4.5));
// pairs[0].first.setPosition(pos(1.5, 0.5));
// pairs[0].first.setPosition(pos(4.0, 0.5));
// pairs[0].first.setPosition(pos(5.0, 0.5));
// pairs[0].first.setPosition(pos(-0.6, 0.5));

// const fps = 60;
// const secPerFrame = 1 / fps;
// const framesPerDegree = 4;
// const secPerDegree = framesPerDegree * secPerFrame;

let frame = -1;
const loop = new AnimationLoop(undefined, render);
const runner = new EaseRunner();

elPause.addEventListener("change", () => {
  if (elPause.checked)
    loop.stop();
  else
    loop.start();
});

drawGraph();
createPolyShapes();
loop.start();
runner.start();

let dragging = false;
const dragOffset = dir(0, 0);
const dragPos = pos(0, 0);
const mouse = pos(0, 0);
const polyPoint = pos(0, 0);

canvas.addEventListener("mousemove", handleMouseMove);
canvas.addEventListener("mousedown", handleMouseDown);
canvas.addEventListener("mouseup", handleMouseUp);

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

function applyTransform() {
  ctx
    .save()
    .translate(screenBounds.center)
    .rotateDegrees(angle)
    .translate(screenBounds.center.negateO());
}

function restoreTransform() {
  ctx.restore();
}

function render() {
  if (++frame === (60 * 5)) {
    loop.stop();
    elPause.checked = true;
  }

  if (!isDirty) return;

  ctx.beginPath().clearRect(ctx.bounds);
  applyTransform();

  const view = graph.getViewport(ctx);
  view.applyTransform();

  if (pair) {
    const { shapeA: first, shapeB: second } = pair;
    second.render(view);
    first.render(view);
    polys && polys.render(view);
    polyd && (polyd.props.strokeStyle = polydBrush) && polyd.render(view);
    drawShape1Vertices(first, view);
    drawShape2Vertices(second, view);
    // drawMinkowskiSupports(pair, view);
  }

  sumState && drawState(sumState, view, sumState === sumStates[sumStates.length - 1]);
  diffState && drawState(diffState, view, diffState === diffStates[diffStates.length - 1]);

  // pair && drawSat(pair, view);
  view.restoreTransform();
  restoreTransform();
  isDirty = false;
}

function updateMouse(ev: MouseEvent) {
  const view = graph.getViewport(ctx);
  const rect = canvas.getBoundingClientRect();
  mouse.withXY(ev.clientX - rect.left, ev.clientY - rect.top);
  // mouse.withXY(ev.offsetX, ev.offsetY);
  view.toWorld(mouse, true, mouse);
  // elText.value = `${mouse}`;
}

function handleMouseMove(ev: MouseEvent) {
  if (!polyd) return;

  if (!dragging) {
    // polyd.toLocal(mouse, polyPoint);
    // if (polyd.containsPoint(polyPoint))
    //   polydBrush !== "blue" && (polydBrush = "blue") && (isDirty = true);
    // else
    //   polydBrush !== "green" && (polydBrush = "green") && (isDirty = true);

    return;
  }

  updateMouse(ev);
  mouse.displaceByO(dragOffset, dragPos);
  polyd.setPosition(dragPos);
  isDirty = true;
}

function handleMouseDown(ev: MouseEvent) {
  if (dragging) return;
  if (!polyd) return;
  if (ev.button !== 0) return;

  updateMouse(ev);
  polyd.toLocal(mouse, polyPoint);

  if (!polyd.containsPoint(polyPoint)) return;

  polyd.position.subO(mouse, dragOffset);
  dragging = true;
}

function handleMouseUp(ev: MouseEvent) {
  if (!dragging) return;
  if (ev.button !== 0) return;

  // updateMouse(ev);
  dragging = false;
}

function getLineWidth(props: ContextProps, viewport: Viewport) {
  return viewport.calcLineWidth(props.lineWidth !== undefined ? props.lineWidth : 1);
}

function beginPath(props: ContextProps, view: Viewport) {
  view.ctx.beginPath().withGlobalAlpha(1).withProps(props).withLineWidth(getLineWidth(props, view));
  return view.ctx;
}

function createMinkowskiStates() {
  if (!pair) return;

  if (showStates) {
    Minkowski.createSum("minkowski", pair.shapeA, pair.shapeB, s => sumStates.push([[...s[0]], [...s[1]]]));
    Minkowski.createDiff("minkowski", pair.shapeA, pair.shapeB, s => diffStates.push([[...s[0]], [...s[1]]]));

    const anims: Easer[] = [];

    if (diffStates.length > 0) {
      const anim = new ArrayEaser(diffStates, Math.min(diffStates.length * 0.2, 10), Ease.linear, v => {
        diffState = v;
        isDirty = true;
      });

      anims.push(anim);
    }

    if (sumStates.length > 0) {
      const anim = new ArrayEaser(sumStates, Math.min(sumStates.length * 0.2, 10), Ease.linear, v => {
        sumState = v;
        isDirty = true;
      });

      anims.push(anim);
    }

    if (anims.length === 0) return;

    stateAnim = new SequentialEaser([new ConcurrentEaser(anims), delay]).onCompleted(() => createPolyShapes());
  } else {
    stateAnim = new SequentialEaser([delay]).onCompleted(() => createPolyShapes());
  }

  runner.add(stateAnim);
}

function createPolyShapes() {
  if (stateAnim)
    runner.remove(stateAnim);

  stateAnim = null;
  sumStates = [];
  diffStates = [];
  sumState = null;
  diffState = null;
  pair = null;
  polys = null;
  polyd = null;
  const lineW = 1;

  if (pairs.length === 0) return;

  let i = pairs.length;

  while (i-- > 0) {
    pair = null;
    polys = null;
    polyd = null;
    pairIndex = (pairIndex + 1) % pairs.length;
    pair = pairs[pairIndex];
    const { shapeA: first, shapeB: second } = pair;

    try {
      polys = Minkowski.createSumPoly(first, second);
      polyd = Minkowski.createDiffPoly(first, second);
      first.props = { strokeStyle: colors[0], lineWidth: lineW };
      second.props = { strokeStyle: refBrush, lineWidth: lineW };
      polys && (polys.props = { strokeStyle: "brown", lineWidth: 3 });
      polyd && (polyd.props = { strokeStyle: polydBrush, lineWidth: 3 });

      createMinkowskiStates();
      isDirty = true;
      break;
    } catch (e) {
      console.log(e.message);
    }
  }
}

/*/
function drawMinkowskiSupports(shapes: ShapePair, view: Viewport) {
  const { first, second } = shapes;

  const ms = [
    Minkowski.createShape(first, second, true),
    Minkowski.createShape(first, second, false)
  ];

  ms.forEach(s => {
    if (s) {
      const props: ContextProps = { fillStyle: "black" };
      const support = new SupportPoint(s);
      let radius = 1;

      if (s.getSupport(normal(1, 0), support))
        beginPath(props, view).withFillStyle(colors[0]).fillCircle(support.worldPoint, radius);

      if (s.getSupport(normal(0, 1), support))
        beginPath(props, view).withFillStyle(colors[1]).fillCircle(support.worldPoint, radius *= 0.8);

      if (s.getSupport(normal(-1, 0), support))
        beginPath(props, view).withFillStyle(colors[2]).fillCircle(support.worldPoint, radius *= 0.8);

      if (s.getSupport(normal(0, -1), support))
        beginPath(props, view).withFillStyle(colors[3]).fillCircle(support.worldPoint, radius *= 0.8);
    }
  });
}
//*/

function drawState(state: Minkowski.MinkowskiPointsState, view: Viewport, closePoly: boolean = false) {
  const [points, vertices] = state;
  const props: ContextProps = { strokeStyle: "black", lineWidth: 5 };

  vertices.length > 0 && drawMinkowskiPoly(vertices, props, view, closePoly);
  props.lineDash = [];
  drawMinkowskiVertices(points, props, view);
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
  const props: ContextProps = { fillStyle: "black", lineWidth: 2, lineDash: [] };
  drawVertices(shape, props, view);
}

function drawShape2Vertices(shape: Shape, view: Viewport) {
  const props: ContextProps = { strokeStyle: "black", lineWidth: 2, lineDash: [] };
  drawVertices(shape, props, view);
}

function drawMinkowskiVertices(points: MinkowskiPoint[], props: ContextProps, view: Viewport) {
  const count = points.length;

  for (let i = 0; i < count; i++) {
    const mp = points[i];

    if (!mp) continue;

    beginPath(props, view)
      .withFillStyle(colors[mp.indexA])
      .fillCircle(mp.point, 0.3);

    beginPath(props, view)
      .withStrokeStyle(colors[mp.indexB])
      .strokeCircle(mp.point, 0.5);
  }
}

function drawMinkowskiPoly(points: MinkowskiPoint[], props: ContextProps, view: Viewport, close: boolean = true) {
  beginPath(props, view)
    .withGlobalAlpha(1)
    .poly(points.filter(mp => mp).map(mp => mp.point), close)
    .stroke();
}

/*/
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
//*/
