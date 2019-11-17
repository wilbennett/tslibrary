import { Geometry, IAABB, ICircle, ILine, IPlane, IPolygonBase, IRay, ISegment, ITriangle } from '.';
import { MathEx } from '../../core';
import { assertNever } from '../../utils';
import { Vector } from '../../vectors';

const { isLessOrEqualTo, isGreaterOrEqualTo } = MathEx;

export function containsPoint(geometry: Geometry, point: Vector, epsilon: number = 0) {
  switch (geometry.kind) {
    case "plane": return planeContainsPoint(geometry, point, epsilon);
    case "line": return lineContainsPoint(geometry, point, epsilon);
    case "ray": return rayContainsPoint(geometry, point, epsilon);
    case "segment": return segmentContainsPoint(geometry, point, epsilon);
    case "circle": return circleContainsPoint(geometry, point, epsilon);
    case "polygon": return polygonContainsPoint(geometry, point, epsilon);
    case "aabb": return aabbContainsPoint(geometry, point, epsilon);
    case "triangle": return triangleContainsPoint(geometry, point, epsilon);
    default: return assertNever(geometry);
  }
}

// Plane.
export function planeContainsPoint(plane: IPlane, point: Vector, epsilon: number = 0) {
  return MathEx.isEqualTo(point.dot(plane.normal), 0, epsilon);
}

// Line.
export function lineContainsPoint(line: ILine, point: Vector, epsilon: number = 0) {
  return MathEx.isEqualTo(point.dot(line.normal), 0, epsilon);
}

// Ray.
export function rayContainsPoint(ray: IRay, point: Vector, epsilon: number = 0) {
  const vector = point.subO(ray.position);

  if (!MathEx.isEqualTo(vector.cross2D(ray.direction), 0, epsilon)) return false;

  return ray.direction.dot(vector) > 0;
}

// Segment.
export function segmentContainsPoint(segment: ISegment, point: Vector, epsilon: number = 0) {
  const vector = point.subO(segment.start);

  if (!MathEx.isEqualTo(vector.dot(segment.edgeVector.perpO()), 0, epsilon)) return false;

  const edge = segment.edgeVector;
  const dot = vector.dot(edge);
  return dot >= 0 && dot <= edge.dot(edge);
}

// Circle.
export function circleContainsPoint(circle: ICircle, point: Vector, epsilon: number = 0) {
  const vector = point.subO(circle.position);
  return MathEx.isLessOrEqualTo(vector.dot(vector), circle.radius * circle.radius, epsilon);
}

// Polygon.
// @ts-ignore - unused param.
export function polygonContainsPoint(poly: IPolygonBase, point: Vector, epsilon: number = 0) {
  // TODO: Binary search when many vertices.
  const vertices = poly.vertexList.items;
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

// AABB.
export function aabbContainsPoint(aabb: IAABB, point: Vector, epsilon: number = 0) {
  const min = aabb.min;
  const max = aabb.max;

  if (epsilon === 0)
    return point.x >= min.x
      && point.y >= min.y
      && point.z >= min.z
      && point.x <= max.x
      && point.y <= max.y
      && point.z <= max.z;

  return isGreaterOrEqualTo(point.x, min.x, epsilon)
    && isGreaterOrEqualTo(point.y, min.y, epsilon)
    && isGreaterOrEqualTo(point.z, min.z, epsilon)
    && isLessOrEqualTo(point.x, max.x, epsilon)
    && isLessOrEqualTo(point.y, max.y, epsilon)
    && isLessOrEqualTo(point.z, max.z, epsilon);
}

// Triangle.
export function triangleContainsPoint(triangle: ITriangle, point: Vector, epsilon: number = 0) {
  return polygonContainsPoint(triangle, point, epsilon);
}
