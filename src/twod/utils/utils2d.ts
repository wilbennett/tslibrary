import { Vector } from '../../vectors';

export function calcIntersectTime(point: Vector, direction: Vector, otherPoint: Vector, otherDirection: Vector) {
  const denom = otherDirection.cross2D(direction);

  if (denom === 0) return null;

  const c = otherPoint.subN(point);
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
  result = result || Vector.createPosition(0, 0);
  const edge = end.subN(start);
  const t = point.subN(start).dot(edge) / edge.dot(edge);

  return t < 0 || t > 1
    ? result.copyFrom(start)
    : start.addScaledO(edge, t, result);
}
