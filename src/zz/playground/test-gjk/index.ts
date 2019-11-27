import { AnimationLoop } from '../../../animation';
import { WebColors } from '../../../colors';
import { MathEx, Tristate } from '../../../core';
import {
  ArrayEaser,
  ConcurrentEaser,
  DelayEaser,
  Ease,
  Easer,
  EaseRunner,
  NumberEaser,
  SequentialEaser,
} from '../../../easing';
import { Brush, CanvasContext, ContextProps, getCircleEdge, getCircleVertex, Graph, Viewport } from '../../../twod';
import { Gjk, ShapePair } from '../../../twod/collision';
import {
  CircleShape,
  MinkowskiPoint,
  MinkowskiVertexIterator,
  PolygonShape,
  Shape,
  Simplex,
} from '../../../twod/shapes';
import * as Minkowski from '../../../twod/shapes/minkowski';
import { CircleSegmentInfo, getCircleSegmentInfo, setCircleSegmentCount } from '../../../twod/utils';
import { UiUtils } from '../../../utils';
import { dir, pos, Vector } from '../../../vectors';

// const { ONE_DEGREE } = MathEx;

// console.clear();

//! BUG: Need to figure out issue with circle and triangle.

const ZERO_DIRECTION = dir(0, 0);
let maxSimplexCount = 0;

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
setCircleSegmentCount(showSimplices ? 10 : 30);
setCircleSegmentCount(30);

const graph = new Graph(ctx.bounds, gridSize);
const poly1 = new PolygonShape([pos(4, 5), pos(9, 9), pos(4, 11)]);
const poly2 = new PolygonShape([pos(7, 3), pos(10, 2), pos(12, 7), pos(5, 7)]);
const poly3 = new PolygonShape(5, 2, 90 * Math.PI / 180);
poly3.setPosition(pos(3.0, 3.0));
const poly4 = new PolygonShape(5, 2, 90 * Math.PI / 180);
poly4.setPosition(pos(7.0, 6.0));
const poly5 = new PolygonShape(20, 2, 0 * Math.PI / 180, false);
poly5.setPosition(pos(3.0, 3.0));
const poly6 = new PolygonShape(40, 2.5, 0 * Math.PI / 180, false);
poly6.setPosition(pos(7.0, 6.0));
const circle1 = new CircleShape(2);
circle1.setPosition(pos(3.0, 3.0));
// circle1.angle = 45 * Math.PI / 180;
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
  new ShapePair(circle1, poly5),
  new ShapePair(poly5, poly6),
  new ShapePair(poly5, poly3),
  new ShapePair(poly5, poly4),
  new ShapePair(poly5, poly2),
  new ShapePair(poly5, poly1),
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

const v1 = dir(circle1.radius, 0);
const vanim = new NumberEaser(0, 360, 5, Ease.linear, v => {
  v1.withDegreesMag(v, v1.mag);
  isDirty = true;
});
// runner.add(vanim.repeat(Infinity));

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

  // v1.render(view, circle1.position, { strokeStyle: "black", lineWidth: 1 });
  // const index = calcCircleIndex(v1.radians);
  // beginPath({ fillStyle: "blue" }, view).fillCircle(circle1.toWorld(getCircleVertex(circle1, index)), 0.4);

  if (pair) {
    const { first, second } = pair;
    second.render(view);
    first.render(view);
    polyd && (polyd.props.strokeStyle = polydBrush) && polyd.render(view);
    drawShape1Vertices(first, view);
    drawShape2Vertices(second, view);
    // mkVertices && drawMinkowskiVertices(mkVertices, { lineWidth: 2 }, view);
    simplex && drawSimplex(simplex, view);

    if (first.kind === "circle") {
      const vertices = Minkowski.getWorldVertices(first);
      beginPath(first.props, view).strokePoly(vertices, true);
    }
  }

  // pair && drawSat(pair, view);
  view.restoreTransform();
  restoreTransform();
  isDirty = false;
}

function getVertex(index: number, shape: Shape) {
  if (shape.kind !== "circle") {
    const vertices = shape.vertexList.items;
    return vertices[index];
  }

  return getCircleVertex(shape, index);
}

function getEdge(index: number, shape: Shape) {
  if (shape.kind !== "circle") {
    const vertices = shape.vertexList.items;
    const vertexCount = vertices.length;
    const nextIndex = (index + 1) % vertexCount;
    return vertices[nextIndex].subO(vertices[index]);
  }

  return getCircleEdge(shape, index);
}

function getNextPoint(point: MinkowskiPoint, circleSegments?: CircleSegmentInfo) {
  const { shapeA, shapeB } = point;
  const verticesA = shapeA.vertexList.items;
  const verticesB = shapeB.vertexList.items;
  const { segmentCount } = (circleSegments || getCircleSegmentInfo());
  const vertexCountA = shapeA.kind === "circle" ? segmentCount : verticesA.length;
  const vertexCountB = shapeB.kind === "circle" ? segmentCount : verticesB.length;
  let indexA = point.indexA;
  let indexB = point.indexB;
  const edgeA = shapeA.toWorld(getEdge(indexA, shapeA));
  const edgeB = shapeB.toWorld(getEdge(indexB, shapeB).negateO());

  let edge: Vector;

  if (edgeA.cross2D(edgeB) > 0) {
    edge = edgeA;
    indexA = (indexA + 1) % vertexCountA;
  } else {
    edge = edgeB;
    indexB = (indexB + 1) % vertexCountB;
  }

  const vertex = point.point.addO(edge);
  const pointA = shapeA.toWorld(getVertex(indexA, shapeA));
  const pointB = shapeB.toWorld(getVertex(indexB, shapeB));
  return new MinkowskiPoint(shapeA, shapeB, vertex, indexA, indexB, pointA, pointB);
}

function getPrevPoint(point: MinkowskiPoint, circleSegments?: CircleSegmentInfo): MinkowskiPoint {
  const { shapeA, shapeB } = point;
  const verticesA = shapeA.vertexList.items;
  const verticesB = shapeB.vertexList.items;
  const { segmentCount } = (circleSegments || getCircleSegmentInfo());
  const vertexCountA = shapeA.kind === "circle" ? segmentCount : verticesA.length;
  const vertexCountB = shapeB.kind === "circle" ? segmentCount : verticesB.length;
  let indexA = point.indexA;
  let indexB = point.indexB;
  let currA = indexA;
  let currB = indexB;
  let prevA = point.indexA > 0 ? point.indexA - 1 : vertexCountA - 1;
  let prevB = point.indexB > 0 ? point.indexB - 1 : vertexCountB - 1;
  const prevEdgeA = shapeA.toWorld(getEdge(prevA, shapeA));
  const prevEdgeB = shapeB.toWorld(getEdge(prevB, shapeB).negateO());

  let edge: Vector;

  if (prevEdgeA.cross2D(prevEdgeB) < 0) {
    edge = prevEdgeA;
    indexA = prevA;
    indexB = currB;
  } else {
    edge = prevEdgeB;
    indexA = currA;
    indexB = prevB;
  }

  const vertex = point.point.subO(edge);
  const pointA = shapeA.toWorld(getVertex(indexA, shapeA));
  const pointB = shapeB.toWorld(getVertex(indexB, shapeB));
  return new MinkowskiPoint(shapeA, shapeB, vertex, indexA, indexB, pointA, pointB);
}

/*
function temp() {
  if (!pair) return;
  if (!polyd) return;

  polydBrush = "green";
  simplices = [];
  const { first, second } = pair;
  let direction = second.position.subO(first.position);

  if (direction.equals(ZERO_DIRECTION))
    direction.withXY(1, 0);

  let mka = Minkowski.getDiffPoint(first, second, direction);
  let mkb = Minkowski.getDiffPoint(first, second, direction.negateO());

  if (!mka || !mkb) return;

  let simplex = new Simplex();
  const points = simplex.points;
  direction.clone(simplex.direction);
  points.push(new SupportPoint(polyd, mka.point));
  simplices.push(simplex.clone());
  direction = simplex.direction;

  // mka = getPrevPoint(mka);

  for (let i = 0; i < first.vertexList.items.length + second.vertexList.items.length; i++) {
    // mka = getNextPoint(mka);
    mka = getPrevPoint(mka);
    points.pop();
    points.push(new SupportPoint(polyd, mka.point));
    simplices.push(simplex.clone());
  }

  return;
  direction.negate();
  points.push(new SupportPoint(polyd, mkb.point));
  simplices.push(simplex.clone());

  if (!(mka.point.dot(direction) * mkb.point.dot(direction) <= 0)) return; // Did not cross origin.

  const ao = mka.point.negateO();
  const ab = mkb.point.subO(mka.point);
  let containsOrigin = false;
  let i = 15;

  if (ao.cross2D(ab) > 0) { // Origin to right. Flip so origin is on left.
    const temp = mka;
    mka = mkb;
    mkb = temp;

    ao.negate();
    ab.negate();

    direction.negate();
    points.shift();
    points.push(new SupportPoint(polyd, mkb.point));
    simplices.push(simplex.clone());
  }

  // Walk left.
  let mkc = getNextPoint(mkb);

  ab.perpLeftO(direction);
  points.push(new SupportPoint(polyd, mkc.point));
  simplices.push(simplex.clone());

  const ac = mkc.point.subO(mka.point);

  while (ao.cross2D(ac) < 0 && i-- > 0) {
    mkb.point.copyFrom(mkc.point);
    mkc = getNextPoint(mkc);
    mkc.point.subO(mka.point, ac);

    points.pop();
    points.pop();
    points.push(new SupportPoint(polyd, mkb.point));
    points.push(new SupportPoint(polyd, mkc.point));
    simplices.push(simplex.clone());
  }

  const bo = mkb.point.negateO();
  const bc = mkc.point.subO(mkb.point);
  containsOrigin = bo.cross2D(bc) <= 0;

  i <= 0 && console.log("!!! EXCEEDED MAXIMUM ITERATIONS !!!");

  if (simplices.length > maxSimplexCount) {
    maxSimplexCount = simplices.length;
    console.log(`Max simplices: ${maxSimplexCount}`);

    // if (simplices.length > 5) {
    if (i <= 0) {
      // dragging = false;
      // debugger;
    }
  }

  polydBrush = containsOrigin ? "red" : "green";
  createSimplexAnim();
}
/*/
function temp() {
  if (!pair) return;
  if (!polyd) return;

  polydBrush = "green";
  simplices = [];
  const { first, second } = pair;
  let direction = second.position.subO(first.position);

  if (direction.equals(ZERO_DIRECTION))
    direction.withXY(1, 0);

  let mka = Minkowski.getDiffPoint(first, second, direction);
  let mkb = Minkowski.getDiffPoint(first, second, direction.negateO());

  if (!mka || !mkb) return;

  let simplex = new Simplex();
  const points = simplex.points;
  direction.clone(simplex.direction);
  points.push(mka.clone());
  simplices.push(simplex.clone());
  direction = simplex.direction;

  // simplices.pop();
  // if (first.kind === "circle") {
  //   const segs = getCircleSegmentInfo();
  //   for (let i = 0; i < segs.segmentCount; i++) {
  //     const vertex = first.toWorld(getVertex(i, first));
  //     points.pop();
  //     points.push(new SupportPoint(polyd, vertex));
  //     simplices.push(simplex.clone());
  //   }
  //   return;
  // } else {
  //   for (let i = 0; i < first.vertexList.items.length; i++) {
  //     const vertex = first.toWorld(getVertex(i, first));
  //     points.pop();
  //     points.push(new SupportPoint(polyd, vertex));
  //     simplices.push(simplex.clone());
  //   }
  //   return;
  // }

  // const segs = getCircleSegmentInfo();
  // const count = (first.kind === "circle" ? segs.segmentCount : first.vertexList.items.length)
  //   + (second.kind === "circle" ? segs.segmentCount : second.vertexList.items.length);
  // const iter = new MinkowskiVertexIterator(mka);
  // for (let i = 0; i < count; i++) {
  //   // mka = getNextPoint(mka);
  //   // mka = getPrevPoint(mka);
  //   // points.pop();
  //   // points.push(new SupportPoint(polyd, mka.point));
  //   points.push(iter.clone());
  //   simplices.push(simplex.clone());
  //   points.pop();
  //   // iter.next();
  //   iter.prev();
  // }

  // return;
  direction.negate();

  if (mka.point.dot(direction) > 0) return; // a is in front of origin in direction.

  points.push(mkb.clone());
  simplices.push(simplex.clone());

  if (mka.point.magSquared < mkb.point.magSquared) {
    const temp = mka;
    mka = mkb;
    mkb = temp;

    direction.negate();
    points.shift();
    points.push(mkb.clone());
    simplices.push(simplex.clone());
  }

  const ao = mka.point.negateO();
  const ab = mkb.point.subO(mka.point);
  let containsOrigin = false;
  let i = 15;

  if (ao.cross2D(ab) >= 0) { // Walk right.
    // let mkc = getPrevPoint(mkb);
    let mkc = new MinkowskiVertexIterator(mkb);
    mkc.prev();

    ab.perpRightO(direction);
    points.push(mkc.clone());
    simplices.push(simplex.clone());

    const ac = mkc.point.subO(mka.point);

    while (ao.cross2D(ac) > 0 && i-- > 0) {
      mkb.point.copyFrom(mkc.point);
      // mkc = getPrevPoint(mkc);
      mkc.prev();
      mkc.point.subO(mka.point, ac);

      points.splice(1, 1);
      points.push(mkc.clone());
      simplices.push(simplex.clone());
    }

    const bo = mkb.point.negateO();
    const bc = mkc.point.subO(mkb.point);
    const cross = bo.cross2D(bc);
    containsOrigin = cross >= 0;
  } else { // Walk left.
    // let mkc = getNextPoint(mkb);
    let mkc = new MinkowskiVertexIterator(mkb);
    mkc.next();

    ab.perpLeftO(direction);
    points.push(mkc.clone());
    simplices.push(simplex.clone());

    const ac = mkc.point.subO(mka.point);

    while (ao.cross2D(ac) < 0 && i-- > 0) {
      mkb.point.copyFrom(mkc.point);
      // mkc = getNextPoint(mkc);
      mkc.next();
      mkc.point.subO(mka.point, ac);

      points.splice(1, 1);
      points.push(mkc.clone());
      simplices.push(simplex.clone());
    }

    const bo = mkb.point.negateO();
    const bc = mkc.point.subO(mkb.point);
    const cross = bo.cross2D(bc);
    containsOrigin = cross <= 0;
  }

  i <= 0 && console.log("!!! EXCEEDED MAXIMUM ITERATIONS !!!");

  if (simplices.length > maxSimplexCount) {
    maxSimplexCount = simplices.length;
    console.log(`Max simplices: ${maxSimplexCount}`);

    if (simplices.length > 5) {
      // dragging = false;
      // debugger;
    }
  }

  polydBrush = containsOrigin ? "red" : "green";
  createSimplexAnim();
}
//*/

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

  simplexAnim = new SequentialEaser([new ConcurrentEaser(anims), delay]).repeat(Infinity)
    .onCompleted(() => {
      if (stepping) return;

      if (!autoChangeShapes) {
        createSimplexAnim();
        return;
      }

      // if (pairs.length > 1)
      // changeShapes();
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
  // const isColliding = gjk.isCollidingProgress(pair, s => simplices.push(s));
  // polydBrush = isColliding ? "red" : "green";
  polyd = Minkowski.createDiffPoly(pair.first, pair.second);
  polyd && (polyd.props = { strokeStyle: polydBrush, lineWidth: 3 });
  // createSimplexAnim();
  polyd && temp();
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

    // try {
    initPair();
    break;
    // } catch (e) {
    //   console.log(e.message);
    // }
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
