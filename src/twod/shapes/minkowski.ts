import {
  CircleShape,
  MinkowskiPoint,
  MinkowskiPointImpl,
  MinkowskiShape,
  NullMinkowskiPoint,
  PolygonShape,
  Shape,
} from '.';
import { calcCircleVertices, calcCircleVerticesAndEdges, isTriangleCW } from '..';
import { Tristate } from '../../core';
import { assertNever } from '../../utils';
import { normal, Vector } from '../../vectors';
import * as Poly from '../geometry/polygon-utils';
import { CircleSegmentInfo } from '../utils';

export type MinkowskiOperation = (vertexA: Vector, vertexB: Vector) => Vector;
export type MinkowskiPointsState = [MinkowskiPoint[], MinkowskiPoint[]]; // Points, Vertices.
export type MinkowskiPointsCallback = (state: MinkowskiPointsState) => void;

const START_DIRECTION = normal(1, 0);

// Andrew's Algorithm: https://en.wikibooks.org/wiki/Algorithm_Implementation/Geometry/Convex_hull/Monotone_chain
export function convexHull(points: MinkowskiPoint[], stateCallback?: MinkowskiPointsCallback, result?: MinkowskiPoint[]) {
  const state: MinkowskiPointsState | undefined = stateCallback ? [points, []] : undefined;
  const count = points.length;
  points.sort((a, b) => a.point.x == b.point.x ? a.point.y - b.point.y : a.point.x - b.point.x);

  const lower: MinkowskiPoint[] = [];
  state && (state![1] = lower);

  for (let i = 0; i < count; i++) {
    let len = lower.length;

    while (len >= 2 && isTriangleCW(lower[len - 2].point, lower[len - 1].point, points[i].point)) {
      lower.pop();
      len--;
      state && stateCallback!(state);
    }

    lower.push(points[i]);
    state && stateCallback!(state);
  }

  lower.pop();
  const upper: MinkowskiPoint[] = [];

  for (let i = count - 1; i >= 0; i--) {
    let len = upper.length;

    while (len >= 2 && isTriangleCW(upper[len - 2].point, upper[len - 1].point, points[i].point)) {
      upper.pop();
      len--;

      if (state) {
        state[1] = lower.concat(upper);
        stateCallback!(state);
      }
    }

    upper.push(points[i]);

    if (state) {
      state[1] = lower.concat(upper);
      stateCallback!(state);
    }
  }

  upper.pop();
  result || (result = []);
  result.splice(0, result.length, ...lower.concat(upper));

  if (state) {
    state[1] = result;
    stateCallback!(state);
  }

  return result;
}

export function getSumPoint(first: Shape, second: Shape, worldDirection: Vector): MinkowskiPoint {
  const direction = worldDirection.normalizeO();
  const spA = first.getSupport(first.toLocal(direction));
  const spB = second.getSupport(second.toLocal(direction));

  if (!spA) return NullMinkowskiPoint.instance;
  if (!spB) return NullMinkowskiPoint.instance;
  if (!spA.isValid || !spB.isValid) return NullMinkowskiPoint.instance;

  const point = spA.worldPoint.displaceByO(spB.worldPoint);
  return new MinkowskiPointImpl(first, second, point, spA.index, spB.index, direction);
}

export function getDiffPoint(first: Shape, second: Shape, worldDirection: Vector): MinkowskiPoint {
  const direction = worldDirection.normalizeO();
  const spA = first.getSupport(first.toLocal(direction));
  const spB = second.getSupport(second.toLocal(direction.negateO()));

  if (!spA) return NullMinkowskiPoint.instance;
  if (!spB) return NullMinkowskiPoint.instance;
  if (!spA.isValid || !spB.isValid) return NullMinkowskiPoint.instance;

  const point = spA.worldPoint.displaceByNegO(spB.worldPoint);
  return new MinkowskiPointImpl(first, second, point, spA.index, spB.index, direction);
}

// Based on: http://www.arestlessmind.org/2014/12/21/
function verticesVerticesV(
  verticesA: Vector[],
  verticesB: Vector[],
  start: MinkowskiPoint,
  result?: Vector[]): Tristate<Vector[]> {
  const vertexCountA = verticesA.length;
  const vertexCountB = verticesB.length;

  if (vertexCountA === 0 || vertexCountB === 0) return undefined;

  const count = vertexCountA + vertexCountB;
  result || (result = []);
  result.length = count;
  let a = start.indexA;
  let b = start.indexB;
  let edgeA = verticesA[(a + 1) % vertexCountA].subO(verticesA[a]);
  let edgeB = verticesB[(b + 1) % vertexCountB].subO(verticesB[b]);
  let point = start.point.clone();

  for (let i = 0; i < count; i++) {
    result[i] = point;

    if (edgeA.cross2D(edgeB) > 0) { // edgeA is to the right.
      point = point.displaceByO(edgeA);
      a = (a + 1) % vertexCountA;
      verticesA[(a + 1) % vertexCountA].subO(verticesA[a], edgeA);
    } else {
      point = point.displaceByO(edgeB);
      b = (b + 1) % vertexCountB;
      verticesB[(b + 1) % vertexCountB].subO(verticesB[b], edgeB);
    }
  }

  return result;
}

function verticesVerticesEdgesV(
  verticesEdgesA: [Vector[], Vector[]],
  verticesEdgesB: [Vector[], Vector[]],
  start: MinkowskiPoint,
  result?: Vector[]): Tristate<Vector[]> {
  const [verticesA, edgesA] = verticesEdgesA;
  const [verticesB, edgesB] = verticesEdgesB;
  const vertexCountA = verticesA.length;
  const vertexCountB = verticesB.length;
  const edgeCountA = edgesA.length;
  const edgeCountB = edgesB.length;

  if (vertexCountA === 0 || vertexCountB === 0 || edgeCountA === 0 || edgeCountB == 0) return undefined;
  // if (vertexCountA !== edgeCountA || vertexCountB !== edgeCountB) return undefined;

  const count = vertexCountA + vertexCountB;
  result || (result = []);
  result.length = count;
  let a = start.indexA;
  let b = start.indexB;
  let edgeA = edgesA[a];
  let edgeB = edgesB[b];
  let point = start.point.clone();

  for (let i = 0; i < count; i++) {
    result[i] = point;

    if (edgeA.cross2D(edgeB) > 0) { // edgeA is to the right.
      point = point.displaceByO(edgeA);
      a = (a + 1) % edgeCountA;
      edgeA = edgesA[a];
    } else {
      point = point.displaceByO(edgeB);
      b = (b + 1) % edgeCountB;
      edgeB = edgesB[b];
    }
  }

  return result;
}

function verticesVerticesM(
  first: Shape,
  second: Shape,
  verticesA: Vector[],
  verticesB: Vector[],
  start: MinkowskiPoint,
  stateCallback?: MinkowskiPointsCallback,
  result?: MinkowskiPoint[]): Tristate<MinkowskiPoint[]> {
  const vertexCountA = verticesA.length;
  const vertexCountB = verticesB.length;

  if (vertexCountA === 0 || vertexCountB === 0) return undefined;

  const count = vertexCountA + vertexCountB;
  result || (result = []);
  result.length = count;
  const state: MinkowskiPointsState | undefined = stateCallback ? [result, result] : undefined;
  let a = start.indexA;
  let b = start.indexB;
  let edgeA = verticesA[(a + 1) % vertexCountA].subO(verticesA[a]);
  let edgeB = verticesB[(b + 1) % vertexCountB].subO(verticesB[b]);
  let mp = <MinkowskiPoint>start.clone();
  let point = mp.point;

  for (let i = 0; i < count; i++) {
    result[i] = mp;
    stateCallback && stateCallback(state!);

    if (edgeA.cross2D(edgeB) > 0) { // edgeA is to the right.
      point = point.displaceByO(edgeA);
      a = (a + 1) % vertexCountA;
      verticesA[(a + 1) % vertexCountA].subO(verticesA[a], edgeA);
    } else {
      point = point.displaceByO(edgeB);
      b = (b + 1) % vertexCountB;
      verticesB[(b + 1) % vertexCountB].subO(verticesB[b], edgeB);
    }

    // mp = new MinkowskiPointImpl(first, second, point, a, b, verticesA[a], verticesA[b]);
    mp = new MinkowskiPointImpl(first, second, point, a, b);
  }

  stateCallback && stateCallback(state!);
  return result;
}

function verticesVerticesEdgesM(
  first: Shape,
  second: Shape,
  verticesEdgesA: [Vector[], Vector[]],
  verticesEdgesB: [Vector[], Vector[]],
  start: MinkowskiPoint,
  stateCallback?: MinkowskiPointsCallback,
  result?: MinkowskiPoint[]): Tristate<MinkowskiPoint[]> {
  const [verticesA, edgesA] = verticesEdgesA;
  const [verticesB, edgesB] = verticesEdgesB;
  const vertexCountA = verticesA.length;
  const vertexCountB = verticesB.length;
  const edgeCountA = edgesA.length;
  const edgeCountB = edgesB.length;

  if (vertexCountA === 0 || vertexCountB === 0 || edgeCountA === 0 || edgeCountB == 0) return undefined;
  if (vertexCountA !== edgeCountA || vertexCountB !== edgeCountB) return undefined;

  const count = vertexCountA + vertexCountB;
  result || (result = []);
  result.length = count;
  const state: MinkowskiPointsState | undefined = stateCallback ? [result, result] : undefined;
  let a = start.indexA;
  let b = start.indexB;
  let edgeA = edgesA[a];
  let edgeB = edgesB[b];
  let mp = <MinkowskiPoint>start.clone();
  let point = mp.point;

  for (let i = 0; i < count; i++) {
    result[i] = mp;
    stateCallback && stateCallback(state!);

    if (edgeA.cross2D(edgeB) > 0) { // edgeA is to the right.
      point = point.displaceByO(edgeA);
      a = (a + 1) % vertexCountA;
      edgeA = edgesA[a];
    } else {
      point = point.displaceByO(edgeB);
      b = (b + 1) % vertexCountB;
      edgeB = edgesB[b];
    }

    // mp = new MinkowskiPointImpl(first, second, point, a, b, verticesA[a], verticesA[b]);
    mp = new MinkowskiPointImpl(first, second, point, a, b);
  }

  stateCallback && stateCallback(state!);
  return result;
}

export function verticesVertices(
  start: MinkowskiPoint,
  verticesEdgesA: [Vector[], Vector[]],
  verticesEdgesB: [Vector[], Vector[]],
  result?: Vector[]): Tristate<Vector[]>;
export function verticesVertices(
  verticesA: Vector[],
  verticesB: Vector[],
  start: MinkowskiPoint,
  result?: Vector[]): Tristate<Vector[]>;
export function verticesVertices(
  first: Shape,
  second: Shape,
  start: MinkowskiPoint,
  verticesEdgesA: [Vector[], Vector[]],
  verticesEdgesB: [Vector[], Vector[]],
  stateCallback?: MinkowskiPointsCallback,
  result?: MinkowskiPoint[]): Tristate<MinkowskiPoint[]>;
export function verticesVertices(
  first: Shape,
  second: Shape,
  verticesA: Vector[],
  verticesB: Vector[],
  start: MinkowskiPoint,
  stateCallback?: MinkowskiPointsCallback,
  result?: MinkowskiPoint[]): Tristate<MinkowskiPoint[]>;
export function verticesVertices(...args: any[]): Tristate<Vector[]> | Tristate<MinkowskiPoint[]> {
  if (args.length <= 4) {
    if (!Array.isArray(args[0]))
      // @ts-ignore - arguments length.
      return verticesVerticesEdgesV(...args);

    // @ts-ignore - arguments length.
    return verticesVerticesV(...args);
  }

  if (!Array.isArray(args[2]))
    // @ts-ignore - arguments length.
    return verticesVerticesEdgesM(...args);

  // @ts-ignore - arguments length.
  return verticesVerticesM(...args);
}

export function verticesHull(
  verticesA: Vector[],
  verticesB: Vector[],
  op: MinkowskiOperation,
  result?: Vector[]): Tristate<Vector[]> {
  const vertexCountA = verticesA.length;
  const vertexCountB = verticesB.length;

  if (vertexCountA === 0 || vertexCountB === 0) return undefined;

  const res: Vector[] = [];

  for (let a = 0; a < vertexCountA; a++) {
    const pointA = verticesA[a];

    for (let b = 0; b < vertexCountB; b++) {
      const pointB = verticesB[b];
      const point = op(pointA, pointB);
      res.push(point);
    }
  }

  result || (result = []);
  result.push(...Poly.convexHull(res));

  return result;
}

// TODO: Can create optimized circle versions by walking rotated circle vectors.
/*/
function circleCircle(
  circle1: ICircleShape,
  circle2: ICircleShape,
  op: MinkowskiOperation,
  circleSegments: number = circleSegmentCount,
  stateCallback?: MinkowskiPointsCallback,
  result?: MinkowskiPoint[]): Tristate<MinkowskiPoint[]> {
  const segmentCount = Math.max(circleSegments, 5);

  const center1 = circle1.position;
  const radius1 = circle1.radius;
  let circle1Point = Vector.position(center1.x + radius1, center1.y);
  let step = 360 / segmentCount * ONE_DEGREE;
  let circle2Vertices = calcCircleVertices(circle2, segmentCount, new Array<Vector>(segmentCount));

  result || (result = []);
  const state: MinkowskiPointsState | undefined = stateCallback ? [result, []] : undefined;

  for (let c1 = 0; c1 < segmentCount; c1++) {
    for (let c2 = 0; c2 < segmentCount; c2++) {
      const circle2Point = circle2Vertices[c2];
      const point = op(circle1Point, circle2Point);
      const mp = new MinkowskiPointImpl(circle1, circle2, point, circle1Point, circle2Point, c1, c2);
      result.push(mp);

      stateCallback && stateCallback(state!);
    }

    circle1Point = circle1Point.rotateAboutO(center1, step);
  }

  convexHull(result, stateCallback, result);

  if (state) {
    state[1] = result;
    stateCallback!(state);
  }

  return result;
}

function circlePoly(
  circle: ICircleShape,
  poly: Shape,
  op: MinkowskiOperation,
  circleSegments: number = circleSegmentCount,
  stateCallback?: MinkowskiPointsCallback,
  result?: MinkowskiPoint[]): Tristate<MinkowskiPoint[]> {
  const segmentCount = Math.max(circleSegments, 5);
  let polyVertices = poly.vertexList.items;
  const vertexCount = polyVertices.length;

  if (vertexCount === 0) return undefined;

  polyVertices = polyVertices.map(v => poly.toWorld(v));
  const center = circle.position;
  let circlePoint = Vector.position(center.x + circle.radius, center.y);
  let step = 360 / segmentCount * ONE_DEGREE;

  result || (result = []);
  const state: MinkowskiPointsState | undefined = stateCallback ? [result, []] : undefined;

  for (let c = 0; c < segmentCount; c++) {
    for (let p = 0; p < vertexCount; p++) {
      const polyPoint = polyVertices[p];
      const point = op(circlePoint, polyPoint);
      const mp = new MinkowskiPointImpl(circle, poly, point, circlePoint, polyPoint, c, p);
      result.push(mp);

      stateCallback && stateCallback(state!);
    }

    circlePoint = circlePoint.rotateAboutO(center, step);
  }

  convexHull(result, stateCallback, result);

  if (state) {
    state[1] = result;
    stateCallback!(state);
  }

  return result;
}

function polyCircle(
  poly: Shape,
  circle: ICircleShape,
  op: MinkowskiOperation,
  circleSegments: number = circleSegmentCount,
  stateCallback?: MinkowskiPointsCallback,
  result?: MinkowskiPoint[]): Tristate<MinkowskiPoint[]> {
  return verticesVertices(
    poly,
    circle,
    poly.vertexList.items,
    calcCircleVertices(circle, circleSegments),
    op,
    true,
    stateCallback,
    result);
}

function polyPoly(
  first: Shape,
  second: Shape,
  op: MinkowskiOperation,
  stateCallback?: MinkowskiPointsCallback,
  result?: MinkowskiPoint[]): Tristate<MinkowskiPoint[]> {
  return verticesVertices(
    first,
    second,
    first.vertexList.items,
    second.vertexList.items,
    op,
    false,
    stateCallback,
    result);
}
//*/

export function getWorldVertices(
  shape: Shape,
  negate: boolean = false,
  circleSegments?: CircleSegmentInfo,
  // @ts-ignore - unused param. TODO: Use to generate vertices for shapes with none. e.g. planes.
  referenceShape?: Shape): Vector[] {
  if (shape.kind === "circle") {
    let result = calcCircleVertices(shape, true, circleSegments);
    negate && (result = result.map(v => v.negateO()));
    return result;
  }

  const result = shape.getVertices();

  return negate
    ? result.map(v => shape.toWorld(v).negate())
    : result.map(v => shape.toWorld(v));
}

export function getWorldVerticesAndEdges(
  shape: Shape,
  negate: boolean = false,
  circleSegments?: CircleSegmentInfo,
  // @ts-ignore - unused param. TODO: Use to generate vertices for shapes with none. e.g. planes.
  referenceShape?: Shape): [Vector[], Vector[]] {
  if (shape.kind === "circle") {
    const result = calcCircleVerticesAndEdges(shape, true, circleSegments);
    negate && (result[1] = result[1].map(v => v.negateO()));
    return result;
  }

  const result = [shape.getVertices(), shape.getEdgeVectors()];

  return negate
    ? [result[0].map(v => shape.toWorld(v).negate()), result[1].map(v => shape.toWorld(v).negate())]
    : [result[0].map(v => shape.toWorld(v)), result[1].map(v => shape.toWorld(v))];
}

export function createSum(
  kind: "vector",
  first: Shape,
  second: Shape,
  circleSegments?: CircleSegmentInfo,
  result?: Vector[]): Tristate<Vector[]>;
export function createSum(
  kind: "minkowski",
  first: Shape,
  second: Shape,
  stateCallback?: MinkowskiPointsCallback,
  circleSegments?: CircleSegmentInfo,
  result?: MinkowskiPoint[]): Tristate<MinkowskiPoint[]>;
export function createSum(
  kind: "vector" | "minkowski",
  first: Shape,
  second: Shape,
  param4?: any,
  param5?: any,
  param6?: any): Tristate<Vector[]> | Tristate<MinkowskiPoint[]> {
  const start = getSumPoint(first, second, START_DIRECTION);

  if (!start) return undefined;

  if (kind === "minkowski") {
    const stateCallback = param4;
    const circleSegments = param5;
    const result = param6;

    return verticesVerticesEdgesM(
      first,
      second,
      getWorldVerticesAndEdges(first, false, circleSegments, second),
      getWorldVerticesAndEdges(second, false, circleSegments, first),
      start,
      stateCallback,
      result);
  }

  const circleSegments = param4;
  const result = param5;

  return verticesVerticesEdgesV(
    getWorldVerticesAndEdges(first, false, circleSegments, second),
    getWorldVerticesAndEdges(second, false, circleSegments, first),
    start,
    result);
}

export function createDiff(
  kind: "vector",
  first: Shape,
  second: Shape,
  circleSegments?: CircleSegmentInfo,
  result?: Vector[]): Tristate<Vector[]>;
export function createDiff(
  kind: "minkowski",
  first: Shape,
  second: Shape,
  stateCallback?: MinkowskiPointsCallback,
  circleSegments?: CircleSegmentInfo,
  result?: MinkowskiPoint[]): Tristate<MinkowskiPoint[]>;
export function createDiff(
  kind: "vector" | "minkowski",
  first: Shape,
  second: Shape,
  param4?: any,
  param5?: any,
  param6?: any): Tristate<Vector[]> | Tristate<MinkowskiPoint[]> {
  const start = getDiffPoint(first, second, START_DIRECTION);

  if (!start) return undefined;

  if (kind === "minkowski") {
    const stateCallback = param4;
    const circleSegments = param5;
    const result = param6;

    return verticesVerticesEdgesM(
      first,
      second,
      getWorldVerticesAndEdges(first, false, circleSegments, second),
      getWorldVerticesAndEdges(second, true, circleSegments, first),
      start,
      stateCallback,
      result);
  }

  const circleSegments = param4;
  const result = param5;

  return verticesVerticesEdgesV(
    getWorldVerticesAndEdges(first, false, circleSegments, second),
    getWorldVerticesAndEdges(second, true, circleSegments, first),
    start,
    result);
}

export function createPoly(
  first: Shape,
  second: Shape,
  isSum: boolean,
  circleSegments?: CircleSegmentInfo): Tristate<Shape> {
  if (first.kind === "circle" && second.kind === "circle") {
    const radius = first.radius + second.radius;

    const position = isSum
      ? first.position.displaceByO(second.position)
      : first.position.displaceByNegO(second.position);

    const circle = new CircleShape(radius, true);
    circle.setPosition(position);
    return circle;
  }

  const vertices = isSum
    ? createSum("vector", first, second, circleSegments)
    : createDiff("vector", first, second, circleSegments);

  const poly = vertices && new PolygonShape(vertices, true);
  return poly;
}

export function createSumPoly(first: Shape, second: Shape, circleSegments?: CircleSegmentInfo): Tristate<Shape> {
  return createPoly(first, second, true, circleSegments);
}

export function createDiffPoly(first: Shape, second: Shape, circleSegments?: CircleSegmentInfo): Tristate<Shape> {
  return createPoly(first, second, false, circleSegments);
}

export function createShape(first: Shape, second: Shape, isSum: boolean): Tristate<Shape> {
  switch (first.kind) {
    case "circle":
    case "aabb":
    case "polygon":
    case "triangle": break;
    case "plane": return undefined;
    case "minkowski": return undefined;
    default: return assertNever(first);
  }
  switch (second.kind) {
    case "circle":
    case "aabb":
    case "polygon":
    case "triangle": return new MinkowskiShape(first, second, isSum);
    case "plane": return undefined;
    case "minkowski": return undefined;
    default: return assertNever(second);
  }
}

export function createSumShape(first: Shape, second: Shape): Tristate<Shape> {
  return createShape(first, second, true);
}

export function createDiffShape(first: Shape, second: Shape): Tristate<Shape> {
  return createShape(first, second, false);
}
