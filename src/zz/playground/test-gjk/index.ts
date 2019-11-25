import { AnimationLoop } from '../../../animation';
import { WebColors } from '../../../colors';
import { MathEx, Tristate } from '../../../core';
import { ArrayEaser, ConcurrentEaser, DelayEaser, Ease, Easer, EaseRunner, SequentialEaser } from '../../../easing';
import { Brush, CanvasContext, ContextProps, Graph, Viewport } from '../../../twod';
import { Gjk, ShapePair } from '../../../twod/collision';
import { CircleShape, PolygonShape, Shape, Simplex } from '../../../twod/shapes';
import * as Minkowski from '../../../twod/shapes/minkowski';
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
const elStep = UiUtils.getInputElement("step");
const elChangeShapes = UiUtils.getInputElement("changeshapes");
const elPrev = UiUtils.getInputElement("prev");
const elNext = UiUtils.getInputElement("next");
const elPrevPair = UiUtils.getInputElement("prevpair");
const elNextPair = UiUtils.getInputElement("nextpair");
const elText = UiUtils.getInputElement("text");

ctx.fillStyle = WebColors.whitesmoke;
ctx.fillRect(ctx.bounds);

const colors: Brush[] = [
  "red",
  "orange",
  "yellow",
  "green",
  "blue",
  "indigo",
  "violet",
];

const refBrush = "teal";
MathEx.epsilon = 0.0001;
Vector.tipDrawHeight = 1.0;
const screenBounds = ctx.bounds;
// const origin = pos(0, 0);
const gridSize = 20;
let angle = 0;
// const duration = 5;
let isDirty = true;
let autoChangeShapes = true;
// let showStates = true;
let showSimplices = false;
Minkowski.setCircleSegmentCount(showSimplices ? 10 : 30);

const graph = new Graph(ctx.bounds, gridSize);
const poly1 = new PolygonShape([pos(4, 5), pos(9, 9), pos(4, 11)]);
const poly2 = new PolygonShape([pos(7, 3), pos(10, 2), pos(12, 7), pos(5, 7)]);
const poly3 = new PolygonShape(5, 2, 0 * Math.PI / 180);
poly3.setPosition(pos(3.0, 3.0));
const poly4 = new PolygonShape(5, 2, 90 * Math.PI / 180);
poly4.setPosition(pos(7.0, 6.0));
const circle1 = new CircleShape(2);
circle1.setPosition(pos(3.0, 3.0));
circle1.angle = 45 * Math.PI / 180;
const circle2 = new CircleShape(3);
circle2.setPosition(pos(9.0, 6.0));
const circle3 = new CircleShape(2);
circle3.setPosition(circle2.position);

const pairs: ShapePair[] = [
  new ShapePair(circle1, circle2),
  new ShapePair(circle2, circle1),
  new ShapePair(circle3, circle2),
  new ShapePair(circle2, circle3),
  new ShapePair(poly1, circle2),
  new ShapePair(circle1, poly2),
  new ShapePair(circle1, poly4),
  new ShapePair(poly3, poly4),
  new ShapePair(poly3, poly2),
  new ShapePair(poly2, poly3),
  new ShapePair(poly1, poly2),
  new ShapePair(poly2, poly1),
]

const gjk = new Gjk();
let pairIndex = -1;
let pair: ShapePair | null = null;
let polyd: Tristate<Shape> = null;
let polydBrush = "green";
// let mkVertices: Tristate<MinkowskiPoint[]> = [];
let simplices: Simplex[] = [];
let simplex: Simplex | null = null;
let simplexAnim: Easer | null = null;

const delay = new DelayEaser(2);

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
const runner = new EaseRunner(loop);

drawGraph();
changeShapes();
loop.start();
runner.start();

let stepping = false;
let dragging = false;
let dragTarget: Shape | null = null;
const dragOffset = dir(0, 0);
const dragPos = pos(0, 0);
const mouse = pos(0, 0);
const polyPoint = pos(0, 0);

elPause.addEventListener("change", () => {
  if (elPause.checked)
    loop.stop();
  else
    loop.start();
});

elChangeShapes.addEventListener("change", () => {
  autoChangeShapes = elChangeShapes.checked;

  if (autoChangeShapes)
    changeShapes();
});

elPrev.addEventListener("click", () => {
  if (simplices.length === 0) return;

  let i = simplex ? simplices.indexOf(simplex) : 0;
  i--;
  i < 0 && (i = simplices.length - 1);
  simplex = simplices[i];
  elText.value = "" + (i + 1);
  isDirty = true;
  stepping = true;
  elStep.checked = true;

  if (!loop.active)
    loop.start();
});

elNext.addEventListener("click", () => {
  if (simplices.length === 0) return;

  let i = simplex ? simplices.indexOf(simplex) : -1;
  i = (i + 1) % simplices.length;
  simplex = simplices[i];
  elText.value = "" + (i + 1);
  isDirty = true;
  stepping = true;
  elStep.checked = true;

  if (!loop.active)
    loop.start();
});

elPrevPair.addEventListener("click", () => {
  if (pairs.length === 0) return;

  pairIndex--;
  pairIndex < 0 && (pairIndex = pairs.length - 1);

  try {
    initPair();
    isDirty = true;

    if (!loop.active)
      render();
  } catch (e) {
    console.log(e.message);
  }
});

elNextPair.addEventListener("click", () => {
  if (pairs.length === 0) return;

  pairIndex = (pairIndex + 1) % pairs.length;

  try {
    initPair();
    isDirty = true;

    if (!loop.active)
      render();
  } catch (e) {
    console.log(e.message);
  }
});

elStep.addEventListener("change", () => stepping = elStep.checked);
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

  if (stepping) {
    loop.stop();
    elPause.checked = true;
  }

  if (!isDirty) return;

  ctx.beginPath().clearRect(ctx.bounds);
  applyTransform();

  const view = graph.getViewport(ctx);
  view.applyTransform();

  if (pair) {
    const { first, second } = pair;
    second.render(view);
    first.render(view);
    polyd && (polyd.props.strokeStyle = polydBrush) && polyd.render(view);
    drawShape1Vertices(first, view);
    drawShape2Vertices(second, view);
    // mkVertices && drawMinkowskiVertices(mkVertices, { lineWidth: 2 }, view);
    simplex && drawSimplex(simplex, view);
  }

  // pair && drawSat(pair, view);
  view.restoreTransform();
  restoreTransform();
  isDirty = false;
}

function updateMouse(ev: MouseEvent) {
  const view = graph.getViewport(ctx);
  const rect = canvas.getBoundingClientRect();
  mouse.withXY(ev.clientX - rect.left, ev.clientY - rect.top);
  view.toWorld(mouse, true, mouse);
}

function handleMouseMove(ev: MouseEvent) {
  if (!dragTarget) return;
  if (!dragging) return;

  updateMouse(ev);
  mouse.displaceByO(dragOffset, dragPos);
  dragTarget.setPosition(dragPos);
  applyGjk();
  isDirty = true;

  if (!loop.active)
    render();
}

function handleMouseDown(ev: MouseEvent) {
  if (dragging) return;
  if (!pair) return;
  if (ev.button !== 0) return;

  updateMouse(ev);
  const shapes = [pair.first, pair.second];

  for (let i = 0; i < 2; i++) {
    const shape = shapes[i];
    shape.toLocal(mouse, polyPoint);

    if (!shape.containsPoint(polyPoint)) continue;

    shape.position.subO(mouse, dragOffset);
    dragTarget = shape;
    dragging = true;
    break;
  }
}

function handleMouseUp(ev: MouseEvent) {
  if (!dragging) return;
  if (ev.button !== 0) return;

  // updateMouse(ev);
  dragging = false;
  dragTarget = null;
}

function getLineWidth(props: ContextProps, viewport: Viewport) {
  return viewport.calcLineWidth(props.lineWidth !== undefined ? props.lineWidth : 1);
}

function beginPath(props: ContextProps, view: Viewport) {
  view.ctx.beginPath().withGlobalAlpha(1).withProps(props).withLineWidth(getLineWidth(props, view));
  return view.ctx;
}

function createSimplexAnim() {
  if (!pair) return;

  const anims: Easer[] = [];

  if (simplices.length > 0) {
    const anim = new ArrayEaser(simplices, MathEx.clamp(simplices.length * 3.0, 2, 20), Ease.linear, v => {
      if (stepping) return;

      simplex = v;
      elText.value = "" + (simplices.indexOf(simplex) + 1);
      isDirty = true;
    });

    anims.push(anim);
  }

  if (anims.length === 0) return;

  simplexAnim = new SequentialEaser([new ConcurrentEaser(anims), delay])
    .onCompleted(() => {
      if (stepping) return;

      if (!autoChangeShapes) {
        createSimplexAnim();
        return;
      }

      // if (pairs.length > 1)
      changeShapes();
    });

  runner.add(simplexAnim);
}

function clearStateValues() {
  polyd = null;
  // mkVertices = [];
  simplices = [];
  simplex = null;
}

function applyGjk() {
  if (simplexAnim)
    runner.remove(simplexAnim);

  simplexAnim = null;
  clearStateValues();

  if (!pair) return;

  // mkVertices = Minkowski.createDiff("minkowski", pair.first, pair.second);
  const isColliding = gjk.isCollidingProgress(pair, s => simplices.push(s));
  polydBrush = isColliding ? "red" : "green";
  polyd = Minkowski.createDiffPoly(pair.first, pair.second);
  polyd && (polyd.props = { strokeStyle: polydBrush, lineWidth: 3 });
  createSimplexAnim();
  isDirty = true;
}

function initPair() {
  const lineW = 1;
  elText.value = "";
  pair = null;
  clearStateValues();
  pair = pairs[pairIndex];
  const { first, second } = pair;

  first.props = { strokeStyle: colors[0], lineWidth: lineW };
  second.props = { strokeStyle: refBrush, lineWidth: lineW };

  applyGjk();
}

function changeShapes() {
  if (simplexAnim)
    runner.remove(simplexAnim);

  simplexAnim = null;
  pair = null;
  clearStateValues();

  if (pairs.length === 0) return;

  let i = pairs.length;

  while (i-- > 0) {
    pairIndex = (pairIndex + 1) % pairs.length;
    pair = pairs[pairIndex];

    try {
      initPair();
      break;
    } catch (e) {
      console.log(e.message);
    }
  }
}

function drawSimplex(simplex: Simplex, view: Viewport) {
  const propsa: ContextProps = { strokeStyle: "blue", fillStyle: "blue", lineWidth: 2, lineDash: [0.1, 0.1] };
  const propsb: ContextProps = { strokeStyle: "green", fillStyle: "green", lineWidth: 2, lineDash: [0.1, 0.1] };
  const propsc: ContextProps = { strokeStyle: "red", fillStyle: "red", lineWidth: 2, lineDash: [0.1, 0.1] };
  const propsd: ContextProps = { strokeStyle: "magenta", fillStyle: "magenta", lineWidth: 3, lineDash: [] };
  const points = simplex.points;
  let directionOrigin: Vector = pos(0, 0);
  let a: Vector;
  let b: Vector;
  let c: Vector;

  switch (points.length) {
    case 1:
      a = points[0].worldPoint;
      beginPath(propsa, view).fillCircle(a, 0.5);
      directionOrigin = a;
      break;
    case 2:
      a = points[1].worldPoint;
      b = points[0].worldPoint;
      beginPath(propsb, view).fillCircle(b, 0.5);
      beginPath(propsa, view).fillCircle(a, 0.5);
      a.subO(b).render(view, b, propsb);
      directionOrigin = a.addO(b).normalizeW();
      break;
    case 3:
      a = points[2].worldPoint;
      b = points[1].worldPoint;
      c = points[0].worldPoint;
      beginPath(propsc, view).fillCircle(c, 0.5);
      beginPath(propsb, view).fillCircle(b, 0.5);
      beginPath(propsa, view).fillCircle(a, 0.5);
      b.subO(c).render(view, c, propsc);
      a.subO(b).render(view, b, propsb);
      c.subO(a).render(view, a, propsa);
      directionOrigin = c.addO(b).normalizeW();
      break;
  }

  simplex.direction.normalizeScaleO(2).render(view, directionOrigin, propsd);
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

/*
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
//*/

/*/
function drawMinkowskiPoly(points: MinkowskiPoint[], props: ContextProps, view: Viewport, close: boolean = true) {
  beginPath(props, view)
    .withGlobalAlpha(1)
    .poly(points.filter(mp => mp).map(mp => mp.point), close)
    .stroke();
}
//*/

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
