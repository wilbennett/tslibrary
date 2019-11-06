import { Vector } from '../../vectors';

export function calcIntersectTime(point: Vector, direction: Vector, otherPoint: Vector, otherDirection: Vector) {
  const denom = otherDirection.cross2D(direction);

  if (denom === 0) return null;

  const c = otherPoint.subN(point);
  return otherDirection.cross2D(c) / denom;
}
