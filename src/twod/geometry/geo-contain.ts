import { Geometry, ILine, IRay, ISegment } from '.';
import { MathEx } from '../../core';
import { assertNever } from '../../utils';
import { Vector } from '../../vectors';

export function containsPoint(geometry: Geometry, point: Vector, epsilon: number = MathEx.epsilon) {
  switch (geometry.kind) {
    case "line": return lineContainsPoint(geometry, point);
    case "ray": return rayContainsPoint(geometry, point);
    case "segment": return segmentContainsPoint(geometry, point);
    default: return assertNever(geometry);
  }
}

// Line.
export function lineContainsPoint(line: ILine, point: Vector, epsilon: number = MathEx.epsilon) {
  const vector = point.subN(line.point);
  return MathEx.isEqualTo(vector.cross2D(line.direction), 0, epsilon);
}

// Ray.
export function rayContainsPoint(ray: IRay, point: Vector, epsilon: number = MathEx.epsilon) {
  const vector = point.subN(ray.start);

  if (!MathEx.isEqualTo(vector.cross2D(ray.direction), 0, epsilon)) return false;

  return ray.direction.dot(vector) > 0;
}

// Segment.
export function segmentContainsPoint(segment: ISegment, point: Vector, epsilon: number = MathEx.epsilon) {
  return false;
}

// Circle.
// export function containsPoint(circle: ICircle, point: Vector, epsilon: number = MathEx.epsilon) {
//  return false;
// }
