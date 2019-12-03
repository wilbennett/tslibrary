import { MathEx } from '../../core';
import { Vector } from '../../vectors';

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
