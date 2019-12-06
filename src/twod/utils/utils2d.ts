import { MathEx } from '../../core';
import { Vector } from '../../vectors';

const { epsilon: EPSILON, clamp } = MathEx;

export class CircleSegmentInfo {
  constructor(segmentCount: number) {
    this.segmentCount = segmentCount;
  }

  private _segmentCount!: number;
  get segmentCount() { return this._segmentCount; }
  set segmentCount(value) {
    this._segmentCount = Math.max(value, 5);
    this._step = 360 / this._segmentCount * MathEx.ONE_DEGREE;
    this._cos = Math.cos(this._step);
    this._sin = Math.sin(this._step);
    this._ncos = Math.cos(-this._step);
    this._nsin = Math.sin(-this._step);
  }

  private _step!: number;
  get step() { return this._step; }
  private _cos!: number;
  get cos() { return this._cos; }
  private _sin!: number;
  get sin() { return this._sin; }
  private _ncos!: number;
  get ncos() { return this._ncos; }
  private _nsin!: number;
  get nsin() { return this._nsin; }
};

let circleSegmentInfo = new CircleSegmentInfo(30);

export function setCircleSegmentCount(value: number) { circleSegmentInfo.segmentCount = value; }
export function getCircleSegmentInfo() { return circleSegmentInfo; }

export function calcIntersectTime(point: Vector, direction: Vector, otherPoint: Vector, otherDirection: Vector) {
  const denom = otherDirection.cross2D(direction);

  if (denom === 0) return null;

  const c = otherPoint.subO(point);
  return otherDirection.cross2D(c) / denom;
}

// Christer Ericson - Real Time Collision Detection.
export function signedTriangleArea(a: Vector, b: Vector, c: Vector) {
  return (a.x - c.x) * (b.y - c.y) - (a.y - c.y) * (b.x - c.x);
}

export function isTriangleCCW(a: Vector, b: Vector, c: Vector) {
  const signedArea = (a.x - c.x) * (b.y - c.y) - (a.y - c.y) * (b.x - c.x);
  return signedArea >= 0;
}

//
// Segment.
// Christer Ericson - Real Time Collision Detection.
export function lineClosestPoint(start: Vector, end: Vector, point: Vector, result?: Vector) {
  result = result || Vector.position(0, 0);
  const edge = end.subO(start);
  const t = point.subO(start).dot(edge) / edge.dot(edge);

  return start.addScaledO(edge, t, result);
}

//
// Segment.
// Christer Ericson - Real Time Collision Detection.
export function segmentClosestPoint(start: Vector, end: Vector, point: Vector, result?: Vector) {
  result = result || Vector.position(0, 0);
  const edge = end.subO(start);
  const t = point.subO(start).dot(edge) / edge.dot(edge);

  if (t <= 0 || isNaN(t)) return result.copyFrom(start);
  if (t >= 1) return result.copyFrom(end);

  return start.addScaledO(edge, t, result);
}

//
// Segment.
// Christer Ericson - Real Time Collision Detection.
export function segmentSqrDistToPoint(start: Vector, end: Vector, point: Vector) {
  const startToEnd = end.subO(start);
  const startToPoint = point.subO(start);
  const endToPoint = point.subO(end);

  const projection = startToPoint.dot(startToEnd);

  if (projection <= 0) return startToPoint.magSquared;

  const segmentLengthSqr = startToEnd.magSquared;

  if (projection >= segmentLengthSqr) return endToPoint.magSquared;

  return startToPoint.magSquared - projection * projection / segmentLengthSqr;
}

//
// Segment.
// Christer Ericson - Real Time Collision Detection.
export function segmentSegmentClosestPoints(p1: Vector, q1: Vector, p2: Vector, q2: Vector, c1: Vector, c2: Vector) {
  const d1 = q1.subO(p1); // Direction vector of segment S1
  const d2 = q2.subO(p2); // Direction vector of segment S2
  const r = p1.subO(p2);
  const a = d1.dot(d1); // Squared length of segment S1, always nonnegative
  const e = d2.dot(d2); // Squared length of segment S2, always nonnegative
  const f = d2.dot(r);

  // Check if either or both segments degenerate into points
  if (a <= EPSILON && e <= EPSILON) { // Both segments degenerate into points
    c1.copyFrom(p1);
    c2.copyFrom(p2);
    return c1.subO(c2).dot(c1.subO(c2));
  }

  let s: number;
  let t: number;

  if (a <= EPSILON) { // First segment degenerates into a point
    s = 0;
    t = f / e; // s = 0 => t = (b*s + f) / e = f / e
    t = clamp(t, 0, 1);
  } else {
    const c = d1.dot(r);

    if (e <= EPSILON) { // Second segment degenerates into a point
      t = 0;
      s = clamp(-c / a, 0, 1); // t = 0 => s = (b*t - c) / a = -c / a
    } else { // The general nondegenerate case starts here
      const b = d1.dot(d2);
      const denom = a * e - b * b; // Always nonnegative
      // If segments not parallel, compute closest point on L1 to L2 and
      // clamp to segment S1. Else pick arbitrary s (here 0)
      if (denom !== 0) {
        s = clamp((b * f - c * e) / denom, 0, 1);
      } else
        s = 0;
      // Compute point on L2 closest to S1(s) using
      // t = Dot((P1 + D1*s) - P2,D2) / Dot(D2,D2) = (b*s + f) / e
      t = (b * s + f) / e;
      // If t in [0,1] done. Else clamp t, recompute s for the new value
      // of t using s = Dot((P2 + D2*t) - P1,D1) / Dot(D1,D1)= (t*b - c) / a
      // and clamp s to [0, 1]
      if (t < 0) {
        t = 0;
        s = clamp(-c / a, 0, 1);
      } else if (t > 1) {
        t = 1;
        s = clamp((b - c) / a, 0, 1);
      }
    }
  }

  p1.displaceByScaledO(d1, s, c1);
  p2.displaceByScaledO(d2, t, c2);
  return c1.subO(c2).dot(c1.subO(c2));
}

