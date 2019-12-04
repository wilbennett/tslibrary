import { AnimationLoop } from '../../../animation';
import { WebColors } from '../../../colors';
import { MathEx, Tristate } from '../../../core';
import { ArrayEaser, ConcurrentEaser, DelayEaser, Ease, Easer, EaseRunner, SequentialEaser } from '../../../easing';
import { Bounds } from '../../../misc';
import { Brush, CanvasContext, ContextProps, Graph, ISegment, Segment, Viewport } from '../../../twod';
import { ClipState, Collider, Contact, Gjk, ShapePair, Wcb, Wcb2, Sutherland } from '../../../twod/collision';
import {
  CircleShape,
  Edge,
  MinkowskiDiffIterator,
  PolygonShape,
  Shape,
  Simplex,
  SupportPointImpl,
} from '../../../twod/shapes';
import * as Minkowski from '../../../twod/shapes/minkowski';
import { setCircleSegmentCount } from '../../../twod/utils';
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
const elCollider = UiUtils.getSelectElement("collider");

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
const pauseAfterSeconds = 30;
let isDirty = true;
let autoChangeShapes = true;
// let showStates = true;
let showSimplices = false;
setCircleSegmentCount(showSimplices ? 10 : 30);
setCircleSegmentCount(360);
setCircleSegmentCount(20);
// setCircleSegmentCount(8);

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
// circle1.setPosition(pos(9.0, 3.0));
// circle1.angle = 45 * Math.PI / 180;
const circle2 = new CircleShape(3);
circle2.setPosition(pos(9.0, 6.0));
const circle3 = new CircleShape(2);
circle3.setPosition(circle2.position);
const box1 = new PolygonShape([pos(2, 8), pos(6, 4), pos(9, 7), pos(5, 11)]);
const box2 = new PolygonShape([pos(4, 2), pos(12, 2), pos(12, 5), pos(4, 5)]);
const box3 = new PolygonShape([pos(9, 4), pos(13, 3), pos(14, 7), pos(10, 8)]);
// box3.setPosition(pos(7.5, 5.5));
const box4 = new PolygonShape([pos(4, 2), pos(7, 2), pos(7, 4), pos(4, 4)]);
box4.setPosition(pos(3, 3));
const box5 = new PolygonShape([pos(8, 4), pos(14, 4), pos(14, 9), pos(8, 9)]);

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
  new ShapePair(box5, box2),
  new ShapePair(box1, box2),
  new ShapePair(box3, box2),
  new ShapePair(box4, box2),
]

const colliders: [string, Collider][] = [
  ["WCB2", new Wcb2()],
  ["WCB", new Wcb()],
  ["GJK", new Gjk()],
];

let pairIndex = -1;
let pair: ShapePair | null = null;
let polyd: Tristate<Shape> = null;
let polydBrush = "green";
// let mkVertices: Tristate<MinkowskiPoint[]> = [];
let simplexList: Simplex[][] = [];
let simplices: Simplex[] = [];
let stateAnim: Easer | null = null;
let contact: Tristate<Contact> = null;
let clipStates: ClipState[] = [];
let clipState: Tristate<ClipState> = null;
let clipAnim: Easer | null = null;

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

populateColliders();
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

  stepping = false;
  elStep.checked = false;
});

elChangeShapes.addEventListener("change", () => {
  autoChangeShapes = elChangeShapes.checked;

  if (autoChangeShapes)
    changeShapes();
});

elPrev.addEventListener("click", () => {
  if (simplexList.length === 0) return;

  const list = simplexList[0];

  if (list.length === 0) return;

  let simplex = simplices.find(s => list.find(ls => ls === s));
  // simplex || (simplex = list[0]);

  let i = simplex ? list.indexOf(simplex) : 0;
  i--;
  i < 0 && (i = list.length - 1);
  simplices = [];

  simplexList.forEach(l => {
    if (i < l.length)
      simplices.push(l[i]);
  });

  elText.value = "" + (i + 1);
  isDirty = true;
  stepping = true;
  elStep.checked = true;

  if (!loop.active)
    loop.start();
});

elNext.addEventListener("click", () => {
  if (simplexList.length === 0) return;

  const list = simplexList[0];

  if (list.length === 0) return;

  let simplex = simplices.find(s => list.find(ls => ls === s));
  // simplex || (simplex = list[0]);

  let i = simplex ? list.indexOf(simplex) : list.length - 1;
  i = (i + 1) % list.length;
  simplices = [];

  simplexList.forEach(l => {
    if (i < l.length)
      simplices.push(l[i]);
  });

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

  // try {
  initPair();
  isDirty = true;

  if (!loop.active)
    render();
  // } catch (e) {
  //   console.log(e.message);
  // }
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

elCollider.addEventListener("change", () => {
  applyCollider();

  if (!loop.active)
    render();
});

elStep.addEventListener("change", () => stepping = elStep.checked);
canvas.addEventListener("mousemove", handleMouseMove);
canvas.addEventListener("mousedown", handleMouseDown);
canvas.addEventListener("mouseup", handleMouseUp);

let mkNormal: Vector | null = null;
let contactPoint: Vector | null = null;
let collisionNormal: Vector | null = null;
let collisionDepth: number = 0;

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
  if (++frame === (60 * pauseAfterSeconds)) {
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
    const { shapeA: first, shapeB: second } = pair;
    polyd && (polyd.props.strokeStyle = polydBrush) && polyd.render(view);
    drawShape1Vertices(first, view);
    drawShape2Vertices(second, view);
    // mkVertices && drawMinkowskiVertices(mkVertices, { lineWidth: 2 }, view);
    mkNormal && mkNormal.scaleO(collisionDepth).render(view, undefined, { strokeStyle: "purple", lineWidth: 3 });
    // contactPoint && contactPoint.render(view, undefined, { fillStyle: "purple", lineWidth: 3 });
    // collisionNormal && contactPoint && collisionNormal.scaleO(collisionDepth).render(view, contactPoint, { strokeStyle: "purple", lineWidth: 3 });
    simplices.forEach(simplex => drawSimplex(simplex, view));
    second.render(view);
    first.render(view);
    contact && drawContact(contact, view);
    clipState && contact && drawClipState(clipState, view);

    /*
    if (first.kind === "circle") {
      const vertices = Minkowski.getWorldVertices(first);
      beginPath(first.props, view).strokePoly(vertices, true);
    }

    if (second.kind === "circle") {
      const vertices = Minkowski.getWorldVertices(second);
      beginPath(second.props, view).strokePoly(vertices, true);
    }
    //*/

    /*
    if (first.kind === "circle" && second.kind === "circle") {
      const props: ContextProps = { strokeStyle: "purple" };
      const tpoly1 = new PolygonShape(getCircleSegmentInfo().segmentCount, first.radius);
      tpoly1.setPosition(first.position);
      tpoly1.props = props;
      const tpoly2 = new PolygonShape(getCircleSegmentInfo().segmentCount, second.radius);
      tpoly2.setPosition(second.position);
      tpoly2.props = props;
      const mkPoly = Minkowski.createDiffPoly(tpoly1, tpoly2)!;
      mkPoly.props = props;
      tpoly1.render(view);
      tpoly2.render(view);
      mkPoly.render(view);
    }
    //*/
  }

  // pair && drawSat(pair, view);
  view.restoreTransform();
  restoreTransform();
  isDirty = false;
}

function temp() {
  polydBrush = "green";
  simplexList.splice(0);
  simplices = [];
  contact = null;
  contactPoint = null;
  collisionNormal = null;
  mkNormal = null;

  if (!pair) return;
  if (!polyd) return;

  const { shapeA: first, shapeB: second } = pair;
  // let direction = second.position.subO(first.position);
  let direction = first.position.subO(second.position);

  if (direction.equals(ZERO_DIRECTION))
    direction.withXY(1, 0);

  let mka = Minkowski.getDiffPoint(first, second, direction);
  mka.adjustDiffPointIfCircle();

  const mkSimplices: Simplex[] = [];
  const spSimplices: Simplex[] = [];
  simplexList.push(mkSimplices, spSimplices);

  let mkSimplex = new Simplex();
  const mkPoints = mkSimplex.points;
  direction.clone(mkSimplex.direction);
  mkPoints.push(mka.clone());
  mkSimplices.push(mkSimplex.clone());
  direction = mkSimplex.direction;

  let spSimplex = new Simplex();
  const spPoints = spSimplex.points;
  const mkai = new MinkowskiDiffIterator(mka);
  spPoints.push(new SupportPointImpl(polyd, mkai.getShapeEdge().worldStart));
  spSimplices.push(spSimplex.clone());

  /*
  mkSimplices.pop();
  direction.withXY(0, 0);
  const segs = getCircleSegmentInfo();
  const iter = new MinkowskiDiffIterator(mkb, segs);
  const count = iter.vertexCount;

  if (first.kind === "circle" && second.kind === "circle") {
    // const ci1 = new CircleIterator(first, mkb.indexA, true, segs);
    // const ci2 = new CircleIterator(second, mkb.indexB, true, segs);
    // const p = ci1.vertex.displaceByNegO(ci2.vertex);
    // mkb.worldPoint = p.clone();
    // console.log(`p: ${p}, ${mkb.worldPoint}`);

    // for (let i = 0; i < segs.segmentCount * 2; i++) {
    //   points.splice(0);
    //   const v11 = ci1.vertex.clone();
    //   const v12 = ci1.nextVertex.clone();
    //   const e1 = ci1.edgeVector.clone();
    //   const v21 = ci2.vertex.clone();
    //   const v22 = ci2.nextVertex.clone();
    //   const e2 = ci2.edgeVector.clone();
    //   v21.negate();
    //   v22.negate();
    //   e2.negate();
    //   points.push(new SupportPointImpl(polyd, p.clone()));

    //   if (e1.cross2D(e2) > 0) {
    //     p.add(e1);
    //     ci1.next();
    //   } else {
    //     p.add(e2);
    //     ci2.next();
    //   }
    //   // points.push(new SupportPointImpl(polyd, v11));
    //   // points.push(new SupportPointImpl(polyd, v2));
    //   // points.push(new SupportPointImpl(polyd, v11.addO(e1)));
    //   mkSimplices.push(simplex.clone());
    //   // ci1.next();
    //   // ci2.next();
    // }

    // for (let i = 0; i < segs.segmentCount; i++) {
    //   points.pop();
    //   points.push(new SupportPointImpl(polyd, ci.vertex.clone()));
    //   mkSimplices.push(simplex.clone());
    //   ci.prev();
    // }
  }

  // iter.worldPoint = mkb.worldPoint.clone();
  // console.log(`iter: ${iter.worldPoint}`);
  for (let i = 0; i < count; i++) {
    points.splice(0);
    // points.push(iter.clone());
    points.push(new SupportPointImpl(polyd, iter.prevVertex.clone()));
    points.push(new SupportPointImpl(polyd, iter.vertex.clone()));
    points.push(new SupportPointImpl(polyd, iter.nextVertex.clone()));
    mkSimplices.push(simplex.clone());
    iter.next();
  }

  for (let i = 0; i < count; i++) {
    points.splice(0);
    iter.prev();
    points.push(new SupportPointImpl(polyd, iter.prevVertex.clone()));
    points.push(new SupportPointImpl(polyd, iter.vertex.clone()));
    points.push(new SupportPointImpl(polyd, iter.nextVertex.clone()));
    mkSimplices.push(simplex.clone());
  }

  createSimplexAnim();
  return;
  //*/
  /*
  mkSimplices.pop();
  for (let i = 0; i < first.vertexList.items.length; i++) {
    const vertex = first.toWorld(getVertex(i, first));
    points.pop();
    points.push(new SupportPointImpl(polyd, vertex));
    mkSimplices.push(simplex.clone());
  }
  return;
  //*/

  /*
  const segs = getCircleSegmentInfo();
  const count = (first.kind === "circle" ? segs.segmentCount : first.vertexList.items.length)
    + (second.kind === "circle" ? segs.segmentCount : second.vertexList.items.length);
  const iter = new MinkowskiVertexIterator(mka);
  for (let i = 0; i < count; i++) {
    // mka = getNextPoint(mka);
    // mka = getPrevPoint(mka);
    // points.pop();
    // points.push(new SupportPointImpl(polyd, mka.point));
    points.push(iter.clone());
    mkSimplices.push(simplex.clone());
    points.pop();
    // iter.next();
    iter.prev();
  }

  return;
  //*/

  direction.negate();
  const adot = mka.point.dot(direction);

  if (adot > 0) return; // a is in front of origin in direction.

  let mkb = Minkowski.getDiffPoint(first, second, direction);

  if (!mkb) return;

  mkb.adjustDiffPointIfCircle();
  mkPoints.push(mkb.clone());
  mkSimplices.push(mkSimplex.clone());
  let mkbi = new MinkowskiDiffIterator(mkb);
  spPoints.push(new SupportPointImpl(polyd, mkbi.getShapeEdge().worldStart));
  spSimplices.push(spSimplex.clone());

  // Early out if distance between shapes not needed.
  // if (!(mkb.point.dot(direction) * adot <= 0)) return; // ab did not cross origin in direction.

  if (mka.point.magSquared < mkb.point.magSquared) {
    const temp = mka;
    mka = mkb;
    mkb = temp;

    direction.negate();
    mkPoints.shift();
    mkPoints.push(mkb.clone());
    mkSimplices.push(mkSimplex.clone());
    mkbi = new MinkowskiDiffIterator(mkb);
    spPoints.push(new SupportPointImpl(polyd, mkbi.getShapeEdge().worldStart));
    spSimplices.push(spSimplex.clone());
  }

  const ao = mka.point.negateO();
  const ab = mkb.point.subO(mka.point);
  let containsOrigin = false;
  let edge1: Edge;
  let edge2: Edge;
  let closestLine: ISegment | null = null;
  let mkc = new MinkowskiDiffIterator(mkb);
  let i = mkc.vertexCount;

  const pushEdge = (e?: Edge) => {
    e || (e = edge1);
    spPoints.splice(0);
    spPoints.push(new SupportPointImpl(polyd!, e.worldStart));
    spPoints.push(new SupportPointImpl(polyd!, e.worldEnd));
    spSimplices.push(spSimplex.clone());
    mkSimplices.push(mkSimplex.clone());
  };

  if (ao.cross2D(ab) >= 0) { // Walk right (CW).
    mkc.prev();

    ab.perpRightO(direction);
    mkPoints.push(mkc.clone());
    mkSimplices.push(mkSimplex.clone());
    spPoints.pop();
    spPoints.push(new SupportPointImpl(polyd, mkc.getShapeEdge().worldEnd));
    spPoints.push(new SupportPointImpl(polyd, mkc.getShapeEdge().worldStart));
    spSimplices.push(spSimplex.clone());

    const ac = mkc.point.subO(mka.point);

    while (ao.cross2D(ac) > 0 && i-- > 0) {
      mkb.point.copyFrom(mkc.point);
      mkc.prev();
      mkc.point.subO(mka.point, ac);

      mkPoints.splice(1, 1);
      mkPoints.push(mkc.clone());
      mkSimplices.push(mkSimplex.clone());
      spPoints.splice(1, 2);
      spPoints.push(new SupportPointImpl(polyd, mkc.getShapeEdge().worldEnd));
      spPoints.push(new SupportPointImpl(polyd, mkc.getShapeEdge().worldStart));
      spSimplices.push(spSimplex.clone());
    }

    const bo = mkb.point.negateO();
    const bc = mkc.point.subO(mkb.point);
    const cross = bo.cross2D(bc);
    containsOrigin = cross >= 0;
    closestLine = new Segment(mkc.point.clone(), mkb.point.clone());

    mkSimplex.direction = Vector.empty;

    edge1 = mkc.getShapeEdge();
    pushEdge();
    edge2 = mkc.getNextShapeEdge();

    if (edge2.shape === edge1.shape) {
      mkc.next();

      while (edge2.shape === edge1.shape) {
        mkc.next();
        edge2 = mkc.getShapeEdge();
      }
    }

    pushEdge(edge2);
  } else { // Walk left (CCW).
    spPoints.pop();
    spPoints.push(new SupportPointImpl(polyd, mkc.getShapeEdge().worldStart));
    spPoints.push(new SupportPointImpl(polyd, mkc.getShapeEdge().worldEnd));
    spSimplices.push(spSimplex.clone());

    mkc.next();

    ab.perpLeftO(direction);
    mkPoints.push(mkc.clone());
    mkSimplices.push(mkSimplex.clone());

    const ac = mkc.point.subO(mka.point);

    while (ao.cross2D(ac) < 0 && i-- > 0) {
      spPoints.splice(1, 2);
      spPoints.push(new SupportPointImpl(polyd, mkc.getShapeEdge().worldStart));
      spPoints.push(new SupportPointImpl(polyd, mkc.getShapeEdge().worldEnd));
      spSimplices.push(spSimplex.clone());

      mkb.point.copyFrom(mkc.point);
      mkc.next();
      mkc.point.subO(mka.point, ac);

      mkPoints.splice(1, 1);
      mkPoints.push(mkc.clone());
      mkSimplices.push(mkSimplex.clone());
    }

    const bo = mkb.point.negateO();
    const bc = mkc.point.subO(mkb.point);
    const cross = bo.cross2D(bc);
    containsOrigin = cross <= 0;
    closestLine = new Segment(mkb.point.clone(), mkc.point.clone());

    mkSimplex.direction = Vector.empty;
    mkc.prev();

    edge1 = mkc.getShapeEdge();
    pushEdge();
    edge2 = mkc.getNextShapeEdge();

    if (edge2.shape === edge1.shape) {
      mkc.next();

      while (edge2.shape === edge1.shape) {
        mkc.next();
        edge2 = mkc.getShapeEdge();
      }
    }

    pushEdge(edge2);
  }

  if (edge1 && edge2 && closestLine) {
    const closestPoint = closestLine.closestPoint(pos(0, 0));

    if (closestPoint) {
      collisionDepth = closestPoint.mag;
      mkNormal = closestPoint.asDirection().normalize();
      collisionNormal = mkNormal.clone();
      contactPoint = edge2.worldStart;

      const normal1 = edge1.worldEnd.subO(edge1.worldStart).perpRight();

      if (collisionNormal.dot(normal1) < 0)
        collisionNormal.negate();

      if (!containsOrigin)
        collisionNormal.negate();
    }
  }

  i <= 0 && console.log("!!! EXCEEDED MAXIMUM ITERATIONS !!!");

  if (mkSimplices.length > maxSimplexCount) {
    maxSimplexCount = mkSimplices.length;
    console.log(`Max simplices: ${maxSimplexCount}`);

    if (mkSimplices.length > 5) {
      // dragging = false;
      // debugger;
    }
  }

  polydBrush = containsOrigin ? "red" : "green";
  createStateAnim();
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
  applyCollider();
  isDirty = true;

  if (!loop.active)
    render();
}

function handleMouseDown(ev: MouseEvent) {
  if (dragging) return;
  if (!pair) return;
  if (ev.button !== 0) return;

  updateMouse(ev);
  const shapes = [pair.shapeA, pair.shapeB];

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

function populateColliders() {
  for (const [colliderName] of colliders) {
    elCollider.appendChild(UiUtils.createOption(colliderName));
  }
}

function getLineWidth(props: ContextProps, viewport: Viewport) {
  return viewport.calcLineWidth(props.lineWidth !== undefined ? props.lineWidth : 1);
}

function beginPath(props: ContextProps, view: Viewport) {
  view.ctx.beginPath().withGlobalAlpha(1).withProps(props).withLineWidth(getLineWidth(props, view));
  return view.ctx;
}

function createStateAnim() {
  if (!pair) return;

  const anims: Easer[] = [];
  const simplexAnims: Easer[] = [];
  const clipAnims: Easer[] = [];
  simplices.splice(0);

  if (simplexList.length > 0) {
    for (const list of simplexList) {
      if (list.length > 0) {
        let simplex = list[0];

        const anim = new ArrayEaser(list, MathEx.clamp(list.length * 1.0, 2, 20), Ease.linear, v => {
          if (stepping) return;

          simplices.remove(simplex);
          simplices.push(v);
          simplex = v;
          elText.value = "" + (simplices.indexOf(simplex) + 1);
          isDirty = true;
        }).onCompleted(() => simplices.splice(0));

        simplexAnims.push(anim);
      }
    }
  }

  if (clipStates.length > 0) {
    const anim = new ArrayEaser(clipStates, MathEx.clamp(clipStates.length * 2.0, 2, 20), Ease.linear, v => {
      clipState = v;
      isDirty = true;
    }).onCompleted(() => clipState = null);

    clipAnims.push(anim);
  }

  simplexAnims.length > 0 && anims.push(new ConcurrentEaser(simplexAnims));
  clipAnims.length > 0 && anims.push(new ConcurrentEaser(clipAnims));

  if (anims.length === 0) return;

  stateAnim = new SequentialEaser([...anims, delay]).repeat(Infinity)
    .onCompleted(() => {
      if (stepping) return;

      if (!autoChangeShapes) {
        createStateAnim();
        return;
      }

      // if (pairs.length > 1)
      // changeShapes();
    });

  runner.add(stateAnim);
}

function pushSimplices(values: Simplex[]) {
  while (simplexList.length < values.length) {
    simplexList.push([]);
  }

  values.forEach((s, i) => simplexList[i].push(s));
}

function pushClipState(clip: ClipState) {
  clip.contact.ensureNormalDirection();
  clipStates.push(clip);
}

function clearStateValues() {
  polyd = null;
  // mkVertices = [];
  simplexList.splice(0);
  simplices = [];
  contact = null;
  clipStates = [];
  clipState = null;
}

function applyCollider() {
  if (stateAnim)
    runner.remove(stateAnim);

  if (clipAnim)
    runner.remove(clipAnim);

  stateAnim = null;
  clipAnim = null;
  clearStateValues();

  if (!pair) return;

  const collider: any = colliders.find(c => c[0] === elCollider.value)![1];
  // mkVertices = Minkowski.createDiff("minkowski", pair.first, pair.second);
  const simplices1: Simplex[] = [];
  simplexList.push(simplices1);
  let isColliding = false;
  // console.clear();

  //*
  // if (collider instanceof Gjk || collider instanceof Wcb)
  //   isColliding = !!collider.isCollidingProgress(pair, pushSimplices);

  if (collider instanceof Wcb || collider instanceof Wcb2)
    contact = collider.calcContactProgress(pair, pair.contact, true, pushSimplices);
  else if (collider instanceof Gjk)
    isColliding = !!collider.isCollidingProgress(pair, pushSimplices);
  //*/

  /*
  if (collider instanceof Wcb)
    contact = collider.calcContact(pair, pair.contact, true);

  if (contact) {
    console.log(`${contact.normal}`);
  }
  //*/

  //*
  if (contact && contact.canClip) {
    // cc.incidentEdge = undefined;
    // cc.referenceEdge = undefined;
    const clipper = new Sutherland();
    clipper.clipProgress(contact.clone(), pushClipState);
  }
  //*/

  // isColliding = !!collider.isColliding(pair);
  // const isColliding = gjk.isCollidingProgress(pair, s => simplices1.push(s));
  // polydBrush = isColliding ? "red" : "green";
  polydBrush = isColliding || contact && contact.isCollision ? "red" : "green";
  polyd = Minkowski.createDiffPoly(pair.shapeA, pair.shapeB);
  polyd && (polyd.props = { strokeStyle: polydBrush, lineWidth: 3 });
  createStateAnim();
  // polyd && temp();
  isDirty = true;
}

function initPair() {
  const lineW = 1;
  elText.value = "";
  pair = null;
  clearStateValues();
  pair = pairs[pairIndex];
  const { shapeA: first, shapeB: second } = pair;

  first.props = { strokeStyle: colors[0], lineWidth: lineW };
  second.props = { strokeStyle: refBrush, lineWidth: lineW };

  applyCollider();
}

function changeShapes() {
  if (stateAnim)
    runner.remove(stateAnim);

  stateAnim = null;
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

function drawClipState(clip: ClipState, view: Viewport) {
  const propsr: ContextProps = { strokeStyle: "purple", fillStyle: "purple", lineWidth: 4, lineDash: [] };
  const propsi: ContextProps = { strokeStyle: "black", fillStyle: "black", lineWidth: 4, lineDash: [0.2, 0.2] };
  const propsp: ContextProps = { strokeStyle: WebColors.blueviolet, fillStyle: WebColors.blueviolet, lineWidth: 3, lineDash: [] };
  const propsn: ContextProps = { strokeStyle: WebColors.blueviolet, fillStyle: WebColors.blueviolet, lineWidth: 4, lineDash: [] };
  const propsc: ContextProps = { strokeStyle: WebColors.gray, fillStyle: WebColors.gray, lineWidth: 4, lineDash: [] };

  const contact = clip.contact;
  const plane = clip.clipPlane;
  const refEdge = contact.referenceEdge;
  const incEdge = contact.incidentEdge;
  const points = contact.points;
  const normal = contact.normal;
  refEdge && beginPath(propsr, view).line(refEdge.worldStart, refEdge.worldEnd).stroke();
  incEdge && beginPath(propsi, view).line(incEdge.worldStart, incEdge.worldEnd).stroke();

  points.forEach(cp => {
    beginPath(propsp, view).strokeRect(Bounds.fromCenter(cp.point, dir(0.8, 0.8)));
    normal && normal.scaleO(cp.depth).render(view, cp.point, propsc);
  });

  plane && (plane.props = propsn) && plane.render(view);
}

function drawContact(contact: Contact, view: Viewport) {
  const propsc: ContextProps = { strokeStyle: WebColors.blueviolet, fillStyle: WebColors.blueviolet, lineWidth: 2, lineDash: [] };
  const propsr: ContextProps = { strokeStyle: "purple", fillStyle: "purple", lineWidth: 4, lineDash: [] };
  const propsi: ContextProps = { strokeStyle: "black", fillStyle: "black", lineWidth: 4, lineDash: [0.2, 0.2] };
  const propsn: ContextProps = { strokeStyle: "black", fillStyle: "black", lineWidth: 4, lineDash: [] };

  const normal = contact.normal;
  const refEdge = contact.referenceEdge;
  const incEdge = contact.incidentEdge;
  refEdge && beginPath(propsr, view).line(refEdge.worldStart, refEdge.worldEnd).stroke();
  incEdge && beginPath(propsi, view).line(incEdge.worldStart, incEdge.worldEnd).stroke();

  contact.points.forEach(cp => {
    beginPath(propsc, view).fillRect(Bounds.fromCenter(cp.point, dir(0.5, 0.5)));
    normal.scaleO(cp.depth).render(view, cp.point, propsn);
  });
}

function drawSimplex(simplex: Simplex, view: Viewport) {
  const props1: ContextProps = { strokeStyle: "red", fillStyle: "red", lineWidth: 2, lineDash: [0.1, 0.1] };
  const props2: ContextProps = { strokeStyle: "green", fillStyle: "green", lineWidth: 2, lineDash: [0.1, 0.1] };
  const props3: ContextProps = { strokeStyle: "blue", fillStyle: "blue", lineWidth: 2, lineDash: [0.1, 0.1] };
  const propsd: ContextProps = { strokeStyle: "magenta", fillStyle: "magenta", lineWidth: 3, lineDash: [] };
  const propso: ContextProps = { strokeStyle: "black", lineWidth: 1, lineDash: [] };
  propso.lineWidth = view.calcLineWidth(propso.lineWidth || 1);
  const points = simplex.points;
  let directionOrigin: Vector = pos(0, 0);
  let a: Vector;
  let b: Vector;
  let c: Vector;

  switch (points.length) {
    case 1:
      a = points[0].worldPoint;
      beginPath(props1, view).fillCircle(a, 0.5).beginPath().withProps(propso).strokeCircle(a, 0.5);
      directionOrigin = a;
      break;
    case 2:
      a = points[1].worldPoint;
      b = points[0].worldPoint;
      beginPath(props1, view).fillCircle(b, 0.5).beginPath().withProps(propso).strokeCircle(b, 0.5);
      beginPath(props2, view).fillCircle(a, 0.5).beginPath().withProps(propso).strokeCircle(a, 0.5);
      a.subO(b).render(view, b, props1);
      directionOrigin = a.addO(b).normalizeW();
      break;
    case 3:
      a = points[2].worldPoint;
      b = points[1].worldPoint;
      c = points[0].worldPoint;
      beginPath(props1, view).fillCircle(c, 0.5).beginPath().withProps(propso).strokeCircle(c, 0.5);
      beginPath(props2, view).fillCircle(b, 0.5).beginPath().withProps(propso).strokeCircle(b, 0.5);
      beginPath(props3, view).fillCircle(a, 0.5).beginPath().withProps(propso).strokeCircle(a, 0.5);
      b.subO(c).render(view, c, props1);
      a.subO(b).render(view, b, props2);
      c.subO(a).render(view, a, props3);
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
