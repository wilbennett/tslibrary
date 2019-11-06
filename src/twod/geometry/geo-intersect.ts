import { Geometry, ILine, IRay, ISegment } from '..';
import { Tristate } from '../../core';
import { assertNever } from '../../utils';
import { Vector } from '../../vectors';
import { calcIntersectionTime } from '../utils';

export function calcIntersectionPoint(a: Geometry, b: Geometry, result?: Vector) {
  switch (a.kind) {
    case "line": return calcLineIntersectionPoint(a, b, result);
    case "ray": return calcRayIntersectionPoint(a, b, result);
    case "segment": return calcSegmentIntersectionPoint(a, b, result);
    default: return assertNever(a);
  }
}

export function calcPoint(t: Tristate<number>, start: Vector, direction: Vector, result?: Vector) {
  if (t === null || t === undefined) return t;

  result = result || Vector.createPosition(0, 0);
  return start.addO(direction.scaleN(t), result);
}

// *************************************************************************************
// Line
// *************************************************************************************
export function calcLineLineIntersection(a: ILine, b: ILine) {
  return calcIntersectionTime(a.point, a.direction, b.point, b.direction);
}

export function calcLineRayIntersection(line: ILine, ray: IRay) {
  const t = calcIntersectionTime(ray.start, ray.direction, line.point, line.direction);

  if (t === null || t === undefined) return t;
  if (t < 0) return null;

  return calcIntersectionTime(line.point, line.direction, ray.start, ray.direction);
}

export function calcLineSegmentIntersection(line: ILine, segment: ISegment) {
  const t = calcIntersectionTime(segment.start, segment.direction, line.point, line.direction);

  if (t === null || t === undefined) return t;
  if (t < 0 || t * t > segment.edgeVector.dot(segment.edgeVector)) return null;

  return calcIntersectionTime(line.point, line.direction, segment.start, segment.direction);
}

export function calcLineLineIntersectionPoint(a: ILine, b: ILine, result?: Vector) {
  const t = calcIntersectionTime(a.point, a.direction, b.point, b.direction);
  return calcPoint(t, a.point, a.direction, result);
}

export function calcLineRayIntersectionPoint(line: ILine, ray: IRay, result?: Vector) {
  const t = calcLineRayIntersection(line, ray);
  return calcPoint(t, line.point, line.direction, result);
}

export function calcLineSegmentIntersectionPoint(line: ILine, segment: ISegment, result?: Vector) {
  const t = calcLineSegmentIntersection(line, segment);
  return calcPoint(t, line.point, line.direction, result);
}

function calcLineIntersectionPoint(line: ILine, b: Geometry, result?: Vector) {
  switch (b.kind) {
    case "line": return calcLineLineIntersectionPoint(line, b, result);
    case "ray": return calcLineRayIntersectionPoint(line, b, result);
    case "segment": return calcLineSegmentIntersectionPoint(line, b, result);
    default: return assertNever(b);
  }
}

// *************************************************************************************
// Ray
// *************************************************************************************
export function calcRayRayIntersection(a: IRay, b: IRay) {
  // TODO: Optimize.
  let t = calcIntersectionTime(b.start, b.direction, a.start, a.direction);

  if (t === null || t === undefined) return t;
  if (t < 0) return null;

  t = calcIntersectionTime(a.start, a.direction, b.start, b.direction);

  if (t === null || t === undefined) return t;

  return (t < 0) ? null : t;
}

export function calcRayLineIntersection(ray: IRay, line: ILine) {
  // TODO: Optimize.
  let t = calcIntersectionTime(line.point, line.direction, ray.start, ray.direction);

  if (t === null || t === undefined) return t;

  t = calcIntersectionTime(ray.start, ray.direction, line.point, line.direction);

  if (t === null || t === undefined) return t;

  return (t < 0) ? null : t;
}

export function calcRaySegmentIntersection(ray: IRay, segment: ISegment) {
  // TODO: Optimize.
  let t = calcIntersectionTime(segment.start, segment.direction, ray.start, ray.direction);

  if (t === null || t === undefined) return t;
  if (t < 0 || t * t > segment.edgeVector.dot(segment.edgeVector)) return null;

  t = calcIntersectionTime(ray.start, ray.direction, segment.start, segment.direction);

  if (t === null || t === undefined) return t;

  return (t < 0) ? null : t;
}

export function calcRayRayIntersectionPoint(a: IRay, b: IRay, result?: Vector) {
  let t = calcRayRayIntersection(a, b);
  return calcPoint(t, a.start, a.direction, result);
}

export function calcRayLineIntersectionPoint(ray: IRay, line: ILine, result?: Vector) {
  let t = calcRayLineIntersection(ray, line);
  return calcPoint(t, ray.start, ray.direction, result);
}

export function calcRaySegmentIntersectionPoint(ray: IRay, segment: ISegment, result?: Vector) {
  let t = calcRaySegmentIntersection(ray, segment);
  return calcPoint(t, ray.start, ray.direction, result);
}

function calcRayIntersectionPoint(ray: IRay, b: Geometry, result?: Vector) {
  switch (b.kind) {
    case "ray": return calcRayRayIntersectionPoint(ray, b, result);
    case "line": return calcRayLineIntersectionPoint(ray, b, result);
    case "segment": return calcRaySegmentIntersectionPoint(ray, b, result);
    default: return assertNever(b);
  }
}
// *************************************************************************************
// Segment
// *************************************************************************************
export function calcSegmentSegmentIntersection(a: ISegment, b: ISegment) {
  // TODO: Optimize.
  let t = calcIntersectionTime(b.start, b.direction, a.start, a.direction);

  if (t === null || t === undefined) return t;
  if (t < 0 || t * t > b.edgeVector.dot(b.edgeVector)) return null;

  t = calcIntersectionTime(a.start, a.direction, b.start, b.direction);

  if (t === null || t === undefined) return t;
  if (t < 0 || t * t > a.edgeVector.dot(a.edgeVector)) return null;

  return t;
}

export function calcSegmentSegmentIntersectionPoint(a: ISegment, b: ISegment, result?: Vector) {
  const t = calcSegmentSegmentIntersection(a, b);
  return calcPoint(t, a.start, a.direction, result);
}

function calcSegmentIntersectionPoint(segment: ISegment, b: Geometry, result?: Vector) {
  switch (b.kind) {
    case "segment": return calcSegmentSegmentIntersectionPoint(segment, b, result);
    case "line": return undefined;
    case "ray": return undefined;
    default: return assertNever(b);
  }
}
