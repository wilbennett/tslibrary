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

