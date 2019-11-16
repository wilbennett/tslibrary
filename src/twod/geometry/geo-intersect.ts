import { Geometry, IAABB, ICircle, ILine, IPlane, IRay, ISegment, ITriangle } from '..';
import { Tristate } from '../../core';
import { assertNever } from '../../utils';
import { Vector } from '../../vectors';
import { calcIntersectTime } from '../utils';

export function calcIntersectPoint(a: Geometry, b: Geometry, result?: Vector): Tristate<Vector> {
  switch (a.kind) {
    case "plane": return planeCalcIntersectPoint(a, b, result);
    case "line": return lineCalcIntersectPoint(a, b, result);
    case "ray": return rayCalcIntersectPoint(a, b, result);
    case "segment": return segmentCalcIntersectPoint(a, b, result);
    case "circle": return circleCalcIntersectPoint(a, b, result);
    case "polygon": return polygonCalcIntersectPoint(a, b, result);
    case "aabb": return aabbCalcIntersectPoint(a, b, result);
    case "triangle": return triangleCalcIntersectPoint(a, b, result);
    default: return assertNever(a);
  }
}

export function calcPoint(t: Tristate<number>, start: Vector, direction: Vector, result?: Vector) {
  if (t === null || t === undefined) return t;

  result = result || Vector.createPosition(0, 0);
  return start.addO(direction.scaleO(t), result);
}

// *************************************************************************************
// Plane
// *************************************************************************************
export function planeCalcPlaneIntersect(a: IPlane, b: IPlane) {
  const aDir = a.normal.perpO();
  const bDir = b.normal.perpO();
  return calcIntersectTime(a.point, aDir, b.point, bDir);
}

export function planeCalcLineIntersect(plane: IPlane, b: ILine) {
  const planeDir = plane.normal.perpO();
  return calcIntersectTime(plane.point, planeDir, b.point, b.direction);
}

export function planeCalcRayIntersect(plane: IPlane, ray: IRay) {
  const planeDir = plane.normal.perpO();
  const planePoint = plane.point;
  const t = calcIntersectTime(ray.start, ray.direction, planePoint, planeDir);

  if (t === null || t === undefined) return t;
  if (t < 0) return null;

  return calcIntersectTime(planePoint, planeDir, ray.start, ray.direction);
}

export function planeCalcSegmentIntersect(plane: IPlane, segment: ISegment) {
  const planeDir = plane.normal.perpO();
  const planePoint = plane.point;
  const t = calcIntersectTime(segment.start, segment.direction, planePoint, planeDir);

  if (t === null || t === undefined) return t;
  if (t < 0 || t * t > segment.edgeVector.dot(segment.edgeVector)) return null;

  return calcIntersectTime(planePoint, planeDir, segment.start, segment.direction);
}

export function planeCalcPlaneIntersectPoint(a: IPlane, b: IPlane, result?: Vector) {
  const aDir = a.normal.perpO();
  const t = planeCalcPlaneIntersect(a, b);
  return calcPoint(t, a.point, aDir, result);
}

export function planeCalcLineIntersectPoint(plane: IPlane, line: ILine, result?: Vector) {
  const planeDir = plane.normal.perpO();
  const t = planeCalcLineIntersect(plane, line);
  return calcPoint(t, plane.point, planeDir, result);
}

export function planeCalcRayIntersectPoint(plane: IPlane, ray: IRay, result?: Vector) {
  const planeDir = plane.normal.perpO();
  const t = planeCalcRayIntersect(plane, ray);
  return calcPoint(t, plane.point, planeDir, result);
}

export function planeCalcSegmentIntersectPoint(plane: IPlane, segment: ISegment, result?: Vector) {
  const planeDir = plane.normal.perpO();
  const t = planeCalcSegmentIntersect(plane, segment);
  return calcPoint(t, plane.point, planeDir, result);
}

function planeCalcIntersectPoint(plane: IPlane, geometry: Geometry, result?: Vector) {
  switch (geometry.kind) {
    case "plane": return planeCalcPlaneIntersectPoint(plane, geometry, result);
    case "line": return planeCalcLineIntersectPoint(plane, geometry, result);
    case "ray": return planeCalcRayIntersectPoint(plane, geometry, result);
    case "segment": return planeCalcSegmentIntersectPoint(plane, geometry, result);
    case "circle": return undefined;
    case "polygon": return undefined;
    case "aabb": return undefined;
    case "triangle": return undefined;
    default: return assertNever(geometry);
  }
}

// *************************************************************************************
// Line
// *************************************************************************************
export function lineCalcPlaneIntersect(line: ILine, plane: IPlane) {
  const planeDir = plane.normal.perpO();
  return calcIntersectTime(line.point, line.direction, plane.point, planeDir);
}

export function lineCalcLineIntersect(a: ILine, b: ILine) {
  return calcIntersectTime(a.point, a.direction, b.point, b.direction);
}

export function lineCalcRayIntersect(line: ILine, ray: IRay) {
  const t = calcIntersectTime(ray.start, ray.direction, line.point, line.direction);

  if (t === null || t === undefined) return t;
  if (t < 0) return null;

  return calcIntersectTime(line.point, line.direction, ray.start, ray.direction);
}

export function lineCalcSegmentIntersect(line: ILine, segment: ISegment) {
  const t = calcIntersectTime(segment.start, segment.direction, line.point, line.direction);

  if (t === null || t === undefined) return t;
  if (t < 0 || t * t > segment.edgeVector.dot(segment.edgeVector)) return null;

  return calcIntersectTime(line.point, line.direction, segment.start, segment.direction);
}

export function lineCalcPlaneIntersectPoint(line: ILine, plane: IPlane, result?: Vector) {
  const t = lineCalcPlaneIntersect(line, plane);
  return calcPoint(t, line.point, line.direction, result);
}

export function lineCalcLineIntersectPoint(a: ILine, b: ILine, result?: Vector) {
  const t = calcIntersectTime(a.point, a.direction, b.point, b.direction);
  return calcPoint(t, a.point, a.direction, result);
}

export function lineCalcRayIntersectPoint(line: ILine, ray: IRay, result?: Vector) {
  const t = lineCalcRayIntersect(line, ray);
  return calcPoint(t, line.point, line.direction, result);
}

export function lineCalcSegmentIntersectPoint(line: ILine, segment: ISegment, result?: Vector) {
  const t = lineCalcSegmentIntersect(line, segment);
  return calcPoint(t, line.point, line.direction, result);
}

function lineCalcIntersectPoint(line: ILine, geometry: Geometry, result?: Vector) {
  switch (geometry.kind) {
    case "plane": return lineCalcPlaneIntersectPoint(line, geometry, result);
    case "line": return lineCalcLineIntersectPoint(line, geometry, result);
    case "ray": return lineCalcRayIntersectPoint(line, geometry, result);
    case "segment": return lineCalcSegmentIntersectPoint(line, geometry, result);
    case "circle": return undefined;
    case "polygon": return undefined;
    case "aabb": return undefined;
    case "triangle": return undefined;
    default: return assertNever(geometry);
  }
}

// *************************************************************************************
// Ray
// *************************************************************************************
export function rayCalcPlaneIntersect(ray: IRay, plane: IPlane) {
  const planeDir = plane.normal.perpO();
  const t = calcIntersectTime(ray.start, ray.direction, plane.point, planeDir);

  if (t === null || t === undefined) return t;
  if (t < 0) return null;

  return t;
}

export function rayCalcRayIntersect(a: IRay, b: IRay) {
  // TODO: Optimize.
  let t = calcIntersectTime(b.start, b.direction, a.start, a.direction);

  if (t === null || t === undefined) return t;
  if (t < 0) return null;

  t = calcIntersectTime(a.start, a.direction, b.start, b.direction);

  if (t === null || t === undefined) return t;

  return (t < 0) ? null : t;
}

export function rayCalcLineIntersect(ray: IRay, line: ILine) {
  // TODO: Optimize.
  let t = calcIntersectTime(line.point, line.direction, ray.start, ray.direction);

  if (t === null || t === undefined) return t;

  t = calcIntersectTime(ray.start, ray.direction, line.point, line.direction);

  if (t === null || t === undefined) return t;

  return (t < 0) ? null : t;
}

export function rayCalcSegmentIntersect(ray: IRay, segment: ISegment) {
  // TODO: Optimize.
  let t = calcIntersectTime(segment.start, segment.direction, ray.start, ray.direction);

  if (t === null || t === undefined) return t;
  if (t < 0 || t * t > segment.edgeVector.dot(segment.edgeVector)) return null;

  t = calcIntersectTime(ray.start, ray.direction, segment.start, segment.direction);

  if (t === null || t === undefined) return t;

  return (t < 0) ? null : t;
}

export function rayCalcPlaneIntersectPoint(ray: IRay, plane: IPlane, result?: Vector) {
  const t = rayCalcPlaneIntersect(ray, plane);
  return calcPoint(t, ray.start, ray.direction, result);
}

export function rayCalcRayIntersectPoint(a: IRay, b: IRay, result?: Vector) {
  let t = rayCalcRayIntersect(a, b);
  return calcPoint(t, a.start, a.direction, result);
}

export function rayCalcLineIntersectPoint(ray: IRay, line: ILine, result?: Vector) {
  let t = rayCalcLineIntersect(ray, line);
  return calcPoint(t, ray.start, ray.direction, result);
}

export function rayCalcSegmentIntersectPoint(ray: IRay, segment: ISegment, result?: Vector) {
  let t = rayCalcSegmentIntersect(ray, segment);
  return calcPoint(t, ray.start, ray.direction, result);
}

function rayCalcIntersectPoint(ray: IRay, geometry: Geometry, result?: Vector) {
  switch (geometry.kind) {
    case "plane": return rayCalcPlaneIntersectPoint(ray, geometry, result);
    case "ray": return rayCalcRayIntersectPoint(ray, geometry, result);
    case "line": return rayCalcLineIntersectPoint(ray, geometry, result);
    case "segment": return rayCalcSegmentIntersectPoint(ray, geometry, result);
    case "circle": return undefined;
    case "polygon": return undefined;
    case "aabb": return undefined;
    case "triangle": return undefined;
    default: return assertNever(geometry);
  }
}
// *************************************************************************************
// Segment
// *************************************************************************************
export function segmentCalcPlaneIntersect(segment: ISegment, plane: IPlane) {
  const planeDir = plane.normal.perpO();
  const t = calcIntersectTime(segment.start, segment.direction, plane.point, planeDir);

  if (t === null || t === undefined) return t;
  if (t < 0 || t * t > segment.edgeVector.dot(segment.edgeVector)) return null;

  return t;
}

export function segmentCalcSegmentIntersect(a: ISegment, b: ISegment) {
  // TODO: Optimize.
  let t = calcIntersectTime(b.start, b.direction, a.start, a.direction);

  if (t === null || t === undefined) return t;
  if (t < 0 || t * t > b.edgeVector.dot(b.edgeVector)) return null;

  t = calcIntersectTime(a.start, a.direction, b.start, b.direction);

  if (t === null || t === undefined) return t;
  if (t < 0 || t * t > a.edgeVector.dot(a.edgeVector)) return null;

  return t;
}

export function segmentCalcLineIntersect(segment: ISegment, line: ILine) {
  // TODO: Optimize.
  let t = calcIntersectTime(line.point, line.direction, segment.start, segment.direction);

  if (t === null || t === undefined) return t;

  t = calcIntersectTime(segment.start, segment.direction, line.point, line.direction);

  if (t === null || t === undefined) return t;
  if (t < 0 || t * t > segment.edgeVector.dot(segment.edgeVector)) return null;

  return t;
}

export function segmentCalcRayIntersect(segment: ISegment, ray: IRay) {
  // TODO: Optimize.
  let t = calcIntersectTime(ray.start, ray.direction, segment.start, segment.direction);

  if (t === null || t === undefined) return t;
  if (t < 0) return null;

  t = calcIntersectTime(segment.start, segment.direction, ray.start, ray.direction);

  if (t === null || t === undefined) return t;
  if (t < 0 || t * t > segment.edgeVector.dot(segment.edgeVector)) return null;

  return t;
}

export function segmentCalcPlaneIntersectPoint(segment: ISegment, plane: IPlane, result?: Vector) {
  const t = segmentCalcPlaneIntersect(segment, plane);
  return calcPoint(t, segment.start, segment.direction, result);
}

export function segmentCalcLineIntersectPoint(segment: ISegment, line: ILine, result?: Vector) {
  const t = segmentCalcLineIntersect(segment, line);
  return calcPoint(t, segment.start, segment.direction, result);
}

export function segmentCalcRayIntersectPoint(segment: ISegment, ray: IRay, result?: Vector) {
  const t = segmentCalcRayIntersect(segment, ray);
  return calcPoint(t, segment.start, segment.direction, result);
}

export function segmentCalcSegmentIntersectPoint(a: ISegment, b: ISegment, result?: Vector) {
  const t = segmentCalcSegmentIntersect(a, b);
  return calcPoint(t, a.start, a.direction, result);
}

function segmentCalcIntersectPoint(segment: ISegment, geometry: Geometry, result?: Vector) {
  switch (geometry.kind) {
    case "plane": return segmentCalcPlaneIntersectPoint(segment, geometry, result);
    case "segment": return segmentCalcSegmentIntersectPoint(segment, geometry, result);
    case "line": return segmentCalcLineIntersectPoint(segment, geometry, result);
    case "ray": return segmentCalcRayIntersectPoint(segment, geometry, result);
    case "circle": return undefined;
    case "polygon": return undefined;
    case "aabb": return undefined;
    case "triangle": return undefined;
    default: return assertNever(geometry);
  }
}

// *************************************************************************************
// Circle
// *************************************************************************************
// @ts-ignore - unused param.
function circleCalcIntersectPoint(circle: ICircle, geometry: Geometry, result?: Vector) {
  return undefined;
}

// *************************************************************************************
// Polygon
// *************************************************************************************
// @ts-ignore - unused param.
function polygonCalcIntersectPoint(poly: IPolygon, geometry: Geometry, result?: Vector) {
  return undefined;
}

// *************************************************************************************
// AABB
// *************************************************************************************
// @ts-ignore - unused param.
function aabbCalcIntersectPoint(aabb: IAABB, geometry: Geometry, result?: Vector) {
  return undefined;
}

// *************************************************************************************
// Triangle
// *************************************************************************************
// @ts-ignore - unused param.
function triangleCalcIntersectPoint(triangle: ITriangle, geometry: Geometry, result?: Vector) {
  return undefined;
}
