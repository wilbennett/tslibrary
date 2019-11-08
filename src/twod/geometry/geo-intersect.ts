import { Geometry, ICircle, ILine, IRay, ISegment } from '..';
import { Tristate } from '../../core';
import { assertNever } from '../../utils';
import { Vector } from '../../vectors';
import { calcIntersectTime } from '../utils';

export function calcIntersectPoint(a: Geometry, b: Geometry, result?: Vector): Tristate<Vector> {
  switch (a.kind) {
    case "line": return calcLineIntersectPoint(a, b, result);
    case "ray": return calcRayIntersectPoint(a, b, result);
    case "segment": return calcSegmentIntersectPoint(a, b, result);
    case "circle": return calcCircleIntersectPoint(a, b, result);
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
export function calcLineLineIntersect(a: ILine, b: ILine) {
  return calcIntersectTime(a.point, a.direction, b.point, b.direction);
}

export function calcLineRayIntersect(line: ILine, ray: IRay) {
  const t = calcIntersectTime(ray.start, ray.direction, line.point, line.direction);

  if (t === null || t === undefined) return t;
  if (t < 0) return null;

  return calcIntersectTime(line.point, line.direction, ray.start, ray.direction);
}

export function calcLineSegmentIntersect(line: ILine, segment: ISegment) {
  const t = calcIntersectTime(segment.start, segment.direction, line.point, line.direction);

  if (t === null || t === undefined) return t;
  if (t < 0 || t * t > segment.edgeVector.dot(segment.edgeVector)) return null;

  return calcIntersectTime(line.point, line.direction, segment.start, segment.direction);
}

export function calcLineLineIntersectPoint(a: ILine, b: ILine, result?: Vector) {
  const t = calcIntersectTime(a.point, a.direction, b.point, b.direction);
  return calcPoint(t, a.point, a.direction, result);
}

export function calcLineRayIntersectPoint(line: ILine, ray: IRay, result?: Vector) {
  const t = calcLineRayIntersect(line, ray);
  return calcPoint(t, line.point, line.direction, result);
}

export function calcLineSegmentIntersectPoint(line: ILine, segment: ISegment, result?: Vector) {
  const t = calcLineSegmentIntersect(line, segment);
  return calcPoint(t, line.point, line.direction, result);
}

function calcLineIntersectPoint(line: ILine, b: Geometry, result?: Vector) {
  switch (b.kind) {
    case "line": return calcLineLineIntersectPoint(line, b, result);
    case "ray": return calcLineRayIntersectPoint(line, b, result);
    case "segment": return calcLineSegmentIntersectPoint(line, b, result);
    case "circle": return undefined;
    default: return assertNever(b);
  }
}

// *************************************************************************************
// Ray
// *************************************************************************************
export function calcRayRayIntersect(a: IRay, b: IRay) {
  // TODO: Optimize.
  let t = calcIntersectTime(b.start, b.direction, a.start, a.direction);

  if (t === null || t === undefined) return t;
  if (t < 0) return null;

  t = calcIntersectTime(a.start, a.direction, b.start, b.direction);

  if (t === null || t === undefined) return t;

  return (t < 0) ? null : t;
}

export function calcRayLineIntersect(ray: IRay, line: ILine) {
  // TODO: Optimize.
  let t = calcIntersectTime(line.point, line.direction, ray.start, ray.direction);

  if (t === null || t === undefined) return t;

  t = calcIntersectTime(ray.start, ray.direction, line.point, line.direction);

  if (t === null || t === undefined) return t;

  return (t < 0) ? null : t;
}

export function calcRaySegmentIntersect(ray: IRay, segment: ISegment) {
  // TODO: Optimize.
  let t = calcIntersectTime(segment.start, segment.direction, ray.start, ray.direction);

  if (t === null || t === undefined) return t;
  if (t < 0 || t * t > segment.edgeVector.dot(segment.edgeVector)) return null;

  t = calcIntersectTime(ray.start, ray.direction, segment.start, segment.direction);

  if (t === null || t === undefined) return t;

  return (t < 0) ? null : t;
}

export function calcRayRayIntersectPoint(a: IRay, b: IRay, result?: Vector) {
  let t = calcRayRayIntersect(a, b);
  return calcPoint(t, a.start, a.direction, result);
}

export function calcRayLineIntersectPoint(ray: IRay, line: ILine, result?: Vector) {
  let t = calcRayLineIntersect(ray, line);
  return calcPoint(t, ray.start, ray.direction, result);
}

export function calcRaySegmentIntersectPoint(ray: IRay, segment: ISegment, result?: Vector) {
  let t = calcRaySegmentIntersect(ray, segment);
  return calcPoint(t, ray.start, ray.direction, result);
}

function calcRayIntersectPoint(ray: IRay, b: Geometry, result?: Vector) {
  switch (b.kind) {
    case "ray": return calcRayRayIntersectPoint(ray, b, result);
    case "line": return calcRayLineIntersectPoint(ray, b, result);
    case "segment": return calcRaySegmentIntersectPoint(ray, b, result);
    case "circle": return undefined;
    default: return assertNever(b);
  }
}
// *************************************************************************************
// Segment
// *************************************************************************************
export function calcSegmentSegmentIntersect(a: ISegment, b: ISegment) {
  // TODO: Optimize.
  let t = calcIntersectTime(b.start, b.direction, a.start, a.direction);

  if (t === null || t === undefined) return t;
  if (t < 0 || t * t > b.edgeVector.dot(b.edgeVector)) return null;

  t = calcIntersectTime(a.start, a.direction, b.start, b.direction);

  if (t === null || t === undefined) return t;
  if (t < 0 || t * t > a.edgeVector.dot(a.edgeVector)) return null;

  return t;
}

export function calcSegmentLineIntersect(segment: ISegment, line: ILine) {
  // TODO: Optimize.
  let t = calcIntersectTime(line.point, line.direction, segment.start, segment.direction);

  if (t === null || t === undefined) return t;

  t = calcIntersectTime(segment.start, segment.direction, line.point, line.direction);

  if (t === null || t === undefined) return t;
  if (t < 0 || t * t > segment.edgeVector.dot(segment.edgeVector)) return null;

  return t;
}

export function calcSegmentRayIntersect(segment: ISegment, ray: IRay) {
  // TODO: Optimize.
  let t = calcIntersectTime(ray.start, ray.direction, segment.start, segment.direction);

  if (t === null || t === undefined) return t;
  if (t < 0) return null;

  t = calcIntersectTime(segment.start, segment.direction, ray.start, ray.direction);

  if (t === null || t === undefined) return t;
  if (t < 0 || t * t > segment.edgeVector.dot(segment.edgeVector)) return null;

  return t;
}

export function calcSegmentSegmentIntersectPoint(a: ISegment, b: ISegment, result?: Vector) {
  const t = calcSegmentSegmentIntersect(a, b);
  return calcPoint(t, a.start, a.direction, result);
}

export function calcSegmentLineIntersectPoint(segment: ISegment, line: ILine, result?: Vector) {
  const t = calcSegmentLineIntersect(segment, line);
  return calcPoint(t, segment.start, segment.direction, result);
}

export function calcSegmentRayIntersectPoint(segment: ISegment, ray: IRay, result?: Vector) {
  const t = calcSegmentRayIntersect(segment, ray);
  return calcPoint(t, segment.start, segment.direction, result);
}

function calcSegmentIntersectPoint(segment: ISegment, b: Geometry, result?: Vector) {
  switch (b.kind) {
    case "segment": return calcSegmentSegmentIntersectPoint(segment, b, result);
    case "line": return calcSegmentLineIntersectPoint(segment, b, result);
    case "ray": return calcSegmentRayIntersectPoint(segment, b, result);
    case "circle": return undefined;
    default: return assertNever(b);
  }
}

// *************************************************************************************
// Circle
// *************************************************************************************
// @ts-ignore - unused param.
function calcCircleIntersectPoint(circle: ICircle, b: Geometry, result?: Vector) {
  return undefined;
}
