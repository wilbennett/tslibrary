import { Geometry, ILine, IRay, ISegment } from '..';
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

export function calcPoint(t: number, start: Vector, direction: Vector, result?: Vector) {
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
  const s = calcIntersectionTime(ray.start, ray.direction, line.point, line.direction);

  if (s === null || s === undefined) return s;
  if (s < 0) return null;

  return calcIntersectionTime(line.point, line.direction, ray.start, ray.direction);
}

export function calcLineLineIntersectionPoint(a: ILine, b: ILine, result?: Vector) {
  const t = calcIntersectionTime(a.point, a.direction, b.point, b.direction);

  if (t === null || t === undefined) return t;

  result = result || Vector.createPosition(0, 0);
  return a.point.addO(a.direction.scaleN(t), result);
}

export function calcLineRayIntersectionPoint(line: ILine, ray: IRay, result?: Vector) {
  const t = calcLineRayIntersection(line, ray);

  if (t === null || t === undefined) return t;

  result = result || Vector.createPosition(0, 0);
  return line.point.addO(line.direction.scaleN(t), result);
}

function calcLineIntersectionPoint(line: ILine, b: Geometry, result?: Vector) {
  switch (b.kind) {
    case "line": return calcLineLineIntersectionPoint(line, b, result);
    case "ray": return calcLineRayIntersectionPoint(line, b, result);
    case "segment": return undefined;
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

export function calcRayRayIntersectionPoint(a: IRay, b: IRay, result?: Vector) {
  let t = calcRayRayIntersection(a, b);

  if (t === null || t === undefined) return t;

  result = result || Vector.createPosition(0, 0);
  return a.start.addO(a.direction.scaleN(t), result);
}

function calcRayIntersectionPoint(ray: IRay, b: Geometry, result?: Vector) {
  switch (b.kind) {
    case "ray": return calcRayRayIntersectionPoint(ray, b, result);
    case "line": return undefined;
    case "segment": return undefined;
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

  if (t === null || t === undefined) return t;

  result = result || Vector.createPosition(0, 0);
  return a.start.addO(a.direction.scaleN(t), result);
}

function calcSegmentIntersectionPoint(segment: ISegment, b: Geometry, result?: Vector) {
  switch (b.kind) {
    case "segment": return calcSegmentSegmentIntersectionPoint(segment, b, result);
    case "line": return undefined;
    case "ray": return undefined;
    default: return assertNever(b);
  }
}
