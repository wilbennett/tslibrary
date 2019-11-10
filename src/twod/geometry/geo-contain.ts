import { Geometry, ICircle, ILine, IPolygon, IRay, ISegment } from '.';
import { MathEx } from '../../core';
import { assertNever } from '../../utils';
import { Vector } from '../../vectors';

export function containsPoint(geometry: Geometry, point: Vector, epsilon: number = MathEx.epsilon) {
  switch (geometry.kind) {
    case "line": return lineContainsPoint(geometry, point, epsilon);
    case "ray": return rayContainsPoint(geometry, point, epsilon);
    case "segment": return segmentContainsPoint(geometry, point, epsilon);
    case "circle": return circleContainsPoint(geometry, point, epsilon);
    case "polygon": return polygonContainsPoint(geometry, point, epsilon);
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
  const vector = point.subN(segment.start);

  if (!MathEx.isEqualTo(vector.dot(segment.edgeVector.perpN()), 0, epsilon)) return false;

  const edge = segment.edgeVector;
  const dot = vector.dot(edge);
  return dot >= 0 && dot <= edge.dot(edge);
}

// Circle.
export function circleContainsPoint(circle: ICircle, point: Vector, epsilon: number = MathEx.epsilon) {
  const vector = point.subN(circle.position);
  return MathEx.isLessOrEqualTo(vector.dot(vector), circle.radius * circle.radius, epsilon);
}

// Polygon.
// @ts-ignore - unused param.
export function polygonContainsPoint(poly: IPolygon, point: Vector, epsilon: number = MathEx.epsilon) {
  const vertices = poly.points.items;
  const count = vertices.length;
  const edge = Vector.create(0, 0);
  const pvector = Vector.create(0, 0);
  vertices[1].subO(vertices[0], edge);
  const side = edge.cross2D(point.subO(vertices[0], pvector));

  for (let i = 1; i < count; i++) {
    let next = i + 1;

    if (next >= count) next = 0;

    vertices[next].subO(vertices[i], edge);
    const curSide = edge.cross2D(point.subO(vertices[i], pvector));

    if (side * curSide < 0) return false;
  }

  return true;
}
