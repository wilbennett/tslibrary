import { Geometry, IAABB, ICircle, ILine, IPolygonBase, IRay, ISegment, ITriangle } from '.';
import { assertNever } from '../../utils';
import { Vector } from '../../vectors';
import * as Utils2D from '../utils/utils2d';
import { polygonContainsPoint } from './geo-contain';

const { abs } = Math;

export function closestPoint(geometry: Geometry, point: Vector, hullOnly: boolean = false, result?: Vector) {
  switch (geometry.kind) {
    case "line": return lineClosestPoint(geometry, point, hullOnly, result);
    case "ray": return rayClosestPoint(geometry, point, hullOnly, result);
    case "segment": return segmentClosestPoint(geometry, point, hullOnly, result);
    case "circle": return circleClosestPoint(geometry, point, hullOnly, result);
    case "polygon": return polygonClosestPoint(geometry, point, hullOnly, result);
    case "aabb": return aabbClosestPoint(geometry, point, hullOnly, result);
    case "triangle": return triangleClosestPoint(geometry, point, hullOnly, result);
    default: return assertNever(geometry);
  }
}

// Line.
// Christer Ericson - Real Time Collision Detection.
// @ts-ignore - unused param.
export function lineClosestPoint(line: ILine, point: Vector, hullOnly: boolean = false, result?: Vector) {
  result = result || Vector.createPosition(0, 0);
  const normal = line.direction.perpLeftO();
  const t = normal.dot(point.subO(line.point));
  return point.subO(normal.scale(t), result);
}

// Ray.
// @ts-ignore - unused param.
export function rayClosestPoint(ray: IRay, point: Vector, hullOnly: boolean = false, result?: Vector) {
  result = result || Vector.createPosition(0, 0);
  const t = point.subO(ray.start).dot(ray.direction);

  return t < 0
    ? result.copyFrom(ray.start)
    : ray.start.addScaledO(ray.direction, t, result);
}

// Segment.
// Christer Ericson - Real Time Collision Detection.
// @ts-ignore - unused param.
export function segmentClosestPoint(segment: ISegment, point: Vector, hullOnly: boolean = false, result?: Vector) {
  result = result || Vector.createPosition(0, 0);
  const edge = segment.edgeVector;
  const t = point.subO(segment.start).dot(edge) / edge.dot(edge);

  return t < 0 || t > 1
    ? result.copyFrom(segment.start)
    : segment.start.addScaledO(edge, t, result);
}

// Circle.
export function circleClosestPoint(circle: ICircle, point: Vector, hullOnly: boolean = false, result?: Vector) {
  result = result || Vector.createPosition(0, 0);
  const vector = point.subO(circle.position);

  if (!hullOnly && vector.magSquared <= circle.radius * circle.radius)
    return result.copyFrom(point)

  return circle.position.displaceByO(vector.withMag(circle.radius), result);
}

// Polygon.
export function polygonClosestPoint(poly: IPolygonBase, point: Vector, hullOnly: boolean = false, result?: Vector) {
  // TODO: Optimize.
  result = result || Vector.createPosition(0, 0);

  if (!hullOnly && polygonContainsPoint(poly, point)) return result.copyFrom(point);

  const vertices = poly.vertices.items;
  const count = vertices.length;
  let minDist = Infinity;
  const closest = Vector.create(0, 0);
  const closestVector = Vector.create(0, 0);

  for (let i = 0; i < count; i++) {
    let next = (i + 1) % count;

    Utils2D.segmentClosestPoint(vertices[i], vertices[next], point, closest);
    const dist = point.subO(closest, closestVector).magSquared;

    if (dist < minDist) {
      result.copyFrom(closest);
      minDist = dist;
    }
  }

  return result;
}

// AABB.
export function aabbClosestPoint(aabb: IAABB, point: Vector, hullOnly: boolean = false, result?: Vector) {
  result = result || Vector.createPosition(0, 0);
  const position = aabb.position;
  const min = aabb.min;
  const max = aabb.max;
  point.clampO(min, max, result);

  if (hullOnly && result.equals(point)) {
    const vector = point.subO(position);

    // TODO: Make dimension agnostic.
    if (abs(vector.x) > abs(vector.y)) {
      result.withX(result.x >= position.x ? max.x : min.x);
    } else {
      result.withY(result.y >= position.y ? max.y : min.y);
    }
  }

  return result;
}

// Triangle.
export function triangleClosestPoint(triangle: ITriangle, point: Vector, hullOnly: boolean = false, result?: Vector) {
  return polygonClosestPoint(triangle, point, hullOnly, result);
}
