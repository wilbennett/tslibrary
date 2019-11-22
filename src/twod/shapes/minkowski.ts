import { CircleShape, ICircleShape, MinkowskiPoint, MinkowskiShape, PolygonShape, Shape } from '.';
import { isTriangleCW } from '..';
import { MathEx, Tristate } from '../../core';
import { assertNever } from '../../utils';
import { Vector } from '../../vectors';

const { ONE_DEGREE } = MathEx;

export type MinkowskiOperation = (vertexA: Vector, vertexB: Vector) => Vector;
export type MinkowskiPointsState = [MinkowskiPoint[], MinkowskiPoint[]]; // Points, Vertices.
export type MinkowskiPointsCallback = (state: MinkowskiPointsState) => void;

let circleSegmentCount = 30;

export function getCircleSegmentCount() { return circleSegmentCount; }
export function setCircleSegmentCount(value: number) { circleSegmentCount = Math.max(value, 5); }

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

export function getPoint(first: Shape, second: Shape, worldDirection: Vector): Tristate<MinkowskiPoint> {
  const direction = worldDirection.normalizeO();
  const axis = first.createWorldAxis(direction);
  const spA = first.getSupport(axis);
  const spB = second.getSupport(axis.toLocalOf(second, true));

  if (!spA) return spA;
  if (!spB) return spB;
  if (!spA.isValid || !spB.isValid) return null;

  const point = spA.worldPoint.displaceByNegO(spB.worldPoint);
  return new MinkowskiPoint(first, second, point, spA.worldPoint, spB.worldPoint, spA.index, spB.index, direction);
}

export function calcCircleVertices(
  circle: ICircleShape,
  circleSegments: number = circleSegmentCount,
  result?: Vector[]): Vector[] {
  const segmentCount = Math.max(circleSegments, 5);
  result || (result = []);
  result.length = segmentCount;

  const center = circle.position;
  let point = Vector.createPosition(center.x + circle.radius, center.y);
  let step = 360 / segmentCount * ONE_DEGREE;

  for (let i = 0; i < segmentCount; i++) {
    result[i] = point;
    point = point.rotateAboutO(center, step);
  }

  return result;
}

export function verticesVertices(
  first: Shape,
  second: Shape,
  verticesA: Vector[],
  verticesB: Vector[],
  op: MinkowskiOperation,
  isWorldB: boolean = false,
  stateCallback?: MinkowskiPointsCallback,
  result?: MinkowskiPoint[]): Tristate<MinkowskiPoint[]> {
  const vertexCountA = verticesA.length;
  const vertexCountB = verticesB.length;

  if (vertexCountA === 0 || vertexCountB === 0) return undefined;

  isWorldB || (verticesB = verticesB.map(v => second.toWorld(v)));
  result || (result = []);
  const state: MinkowskiPointsState | undefined = stateCallback ? [result, []] : undefined;

  for (let a = 0; a < vertexCountA; a++) {
    const pointA = first.toWorld(verticesA[a]);

    for (let b = 0; b < vertexCountB; b++) {
      const pointB = verticesB[b];
      const point = op(pointA, pointB);
      const mp = new MinkowskiPoint(first, second, point, pointA, pointB, a, b);
      result.push(mp);

      stateCallback && stateCallback(state!);
    }
  }

  convexHull(result, stateCallback, result);

  if (state) {
    state[1] = result;
    stateCallback!(state);
  }

  return result;
}

export function circleCircle(
  circle1: ICircleShape,
  circle2: ICircleShape,
  op: MinkowskiOperation,
  circleSegments: number = circleSegmentCount,
  stateCallback?: MinkowskiPointsCallback,
  result?: MinkowskiPoint[]): Tristate<MinkowskiPoint[]> {
  const segmentCount = Math.max(circleSegments, 5);

  const center1 = circle1.position;
  const radius1 = circle1.radius;
  let circle1Point = Vector.createPosition(center1.x + radius1, center1.y);
  let step = 360 / segmentCount * ONE_DEGREE;
  let circle2Vertices = calcCircleVertices(circle2, segmentCount, new Array<Vector>(segmentCount));

  result || (result = []);
  const state: MinkowskiPointsState | undefined = stateCallback ? [result, []] : undefined;

  for (let c1 = 0; c1 < segmentCount; c1++) {
    for (let c2 = 0; c2 < segmentCount; c2++) {
      const circle2Point = circle2Vertices[c2];
      const point = op(circle1Point, circle2Point);
      const mp = new MinkowskiPoint(circle1, circle2, point, circle1Point, circle2Point, c1, c2);
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

export function circlePoly(
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
  let circlePoint = Vector.createPosition(center.x + circle.radius, center.y);
  let step = 360 / segmentCount * ONE_DEGREE;

  result || (result = []);
  const state: MinkowskiPointsState | undefined = stateCallback ? [result, []] : undefined;

  for (let c = 0; c < segmentCount; c++) {
    for (let p = 0; p < vertexCount; p++) {
      const polyPoint = polyVertices[p];
      const point = op(circlePoint, polyPoint);
      const mp = new MinkowskiPoint(circle, poly, point, circlePoint, polyPoint, c, p);
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

export function polyCircle(
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

export function polyPoly(
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

function createVertices(
  op: MinkowskiOperation,
  first: Shape,
  second: Shape,
  stateCallback?: MinkowskiPointsCallback,
  circleSegments: number = circleSegmentCount,
  result?: MinkowskiPoint[]): Tristate<MinkowskiPoint[]> {
  switch (first.kind) {
    case "circle":
      switch (second.kind) {
        case "circle":
          return circleCircle(first, second, op, circleSegments, stateCallback, result);
        default:
          return circlePoly(first, second, op, circleSegments, stateCallback, result);
      }
    default:
      switch (second.kind) {
        case "circle":
          return polyCircle(first, second, op, circleSegments, stateCallback, result);
        default:
          return polyPoly(first, second, op, stateCallback, result);
      }
  }
}

export function createSum(
  first: Shape,
  second: Shape,
  stateCallback?: MinkowskiPointsCallback,
  circleSegments: number = circleSegmentCount,
  result?: MinkowskiPoint[]): Tristate<MinkowskiPoint[]> {
  return createVertices((a, b) => a.displaceByO(b), first, second, stateCallback, circleSegments, result);
}

export function createDiff(
  first: Shape,
  second: Shape,
  stateCallback?: MinkowskiPointsCallback,
  circleSegments: number = circleSegmentCount,
  result?: MinkowskiPoint[]): Tristate<MinkowskiPoint[]> {
  return createVertices((a, b) => a.displaceByNegO(b), first, second, stateCallback, circleSegments, result);
}

export function createPoly(
  first: Shape,
  second: Shape,
  op: MinkowskiOperation,
  stateCallback?: MinkowskiPointsCallback,
  circleSegments: number = circleSegmentCount): Tristate<Shape> {
  if (first.kind === "circle" && second.kind === "circle") {
    const radius = first.radius + second.radius;
    const position = op(first.position, second.position);
    const circle = new CircleShape(radius, true);
    circle.setPosition(position);
    return circle;
  }

  const vertices = createVertices(op, first, second, stateCallback, circleSegments);
  const poly = vertices && new PolygonShape(vertices.map(v => v.point), true);
  return poly;
}

export function createSumPoly(
  first: Shape,
  second: Shape,
  stateCallback?: MinkowskiPointsCallback,
  circleSegments: number = circleSegmentCount): Tristate<Shape> {
  return createPoly(first, second, (a, b) => a.displaceByO(b), stateCallback, circleSegments);
}

export function createDiffPoly(
  first: Shape,
  second: Shape,
  stateCallback?: MinkowskiPointsCallback,
  circleSegments: number = circleSegmentCount): Tristate<Shape> {
  return createPoly(first, second, (a, b) => a.displaceByNegO(b), stateCallback, circleSegments);
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
