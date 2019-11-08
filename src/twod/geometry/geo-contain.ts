import { Geometry, ILine, IRay, ISegment } from '.';
import { assertNever } from '../../utils';
import { Vector } from '../../vectors';

export function containsPoint(geometry: Geometry, point: Vector) {
  switch (geometry.kind) {
    case "line": return lineContainsPoint(geometry, point);
    case "ray": return rayContainsPoint(geometry, point);
    case "segment": return segmentContainsPoint(geometry, point);
    default: return assertNever(geometry);
  }
}

// Line.
export function lineContainsPoint(line: ILine, point: Vector) {
  return false;
}

// Ray.
export function rayContainsPoint(ray: IRay, point: Vector) {
  return false;
}

// Segment.
export function segmentContainsPoint(segment: ISegment, point: Vector) {
  return false;
}

// Circle.
// export function containsPoint(circle: ICircle, point: Vector) {
//  return false;
// }
