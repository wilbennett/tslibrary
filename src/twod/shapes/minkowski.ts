import { MinkowskiPoint, Shape } from '.';
import { isTriangleCW } from '..';
import { Tristate } from '../../core';
import { Vector } from '../../vectors';

export type MinkowskiOperation = (vertexA: Vector, vertexB: Vector) => Vector;
export type MinkowskiPointsState = [MinkowskiPoint[], MinkowskiPoint[]]; // Points, Vertices.
export type MinkowskiPointsCallback = (state: MinkowskiPointsState) => void;

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

export function createVertices(
  first: Shape,
  second: Shape,
  op: MinkowskiOperation,
  stateCallback?: MinkowskiPointsCallback,
  result?: MinkowskiPoint[]): Tristate<MinkowskiPoint[]> {
  const verticesA = first.vertexList.items;
  const verticesB = second.vertexList.items;
  const vertexCountA = verticesA.length;
  const vertexCountB = verticesB.length;

  if (vertexCountA === 0 || vertexCountB === 0) return undefined;

  result || (result = []);
  const state: MinkowskiPointsState | undefined = stateCallback ? [result, []] : undefined;

  for (let a = 0; a < vertexCountA; a++) {
    for (let b = 0; b < vertexCountB; b++) {
      const pointA = first.toWorld(verticesA[a]);
      const pointB = second.toWorld(verticesB[b]);
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

export function createSum(
  first: Shape,
  second: Shape,
  stateCallback?: MinkowskiPointsCallback,
  result?: MinkowskiPoint[]): Tristate<MinkowskiPoint[]> {
  return createVertices(first, second, (a, b) => a.displaceByO(b), stateCallback, result);
}

export function createDiff(
  first: Shape,
  second: Shape,
  stateCallback?: MinkowskiPointsCallback,
  result?: MinkowskiPoint[]): Tristate<MinkowskiPoint[]> {
  return createVertices(first, second, (a, b) => a.displaceByNegO(b), stateCallback, result);
}
