import { MathEx } from '../../core';
import { Vector } from '../../vectors';

const { epsilon: EPSILON, clamp } = MathEx;

export function calcIntersectTime(point: Vector, direction: Vector, otherPoint: Vector, otherDirection: Vector) {
  const denom = otherDirection.cross2D(direction);

  if (denom === 0) return null;

  const c = otherPoint.subO(point);
  return otherDirection.cross2D(c) / denom;
}

// Christer Ericson - Real Time Collision Detection.
export function signedTriangleArea(a: Vector, b: Vector, c: Vector) {
  return (a.x - c.x) * (b.y - c.y) - (a.y - c.y) * (b.x - c.x);
}

export function isTriangleCCW(a: Vector, b: Vector, c: Vector) {
  const signedArea = (a.x - c.x) * (b.y - c.y) - (a.y - c.y) * (b.x - c.x);
  return signedArea >= 0;
}

// Line.
// Christer Ericson - Real Time Collision Detection.
// @ts-ignore - unused param.
export function planeClosestPoint(position: Vector, normal: Vector, point: Vector, result?: Vector) {
  const t = normal.dot(point.subO(position));
  return point.subO(normal.scaleO(t, result), result);
}

//
// Segment.
// Christer Ericson - Real Time Collision Detection.
export function lineClosestPoint(start: Vector, end: Vector, point: Vector, result?: Vector) {
  result = result || Vector.position(0, 0);
  const edge = end.subO(start);
  const t = point.subO(start).dot(edge) / edge.dot(edge);

  return start.addScaledO(edge, t, result);
}

//
// Segment.
// Christer Ericson - Real Time Collision Detection.
export function segmentClosestPoint(start: Vector, end: Vector, point: Vector, result?: Vector) {
  result = result || Vector.position(0, 0);
  const edge = end.subO(start);
  const t = point.subO(start).dot(edge) / edge.dot(edge);

  if (t <= 0 || isNaN(t)) return result.copyFrom(start);
  if (t >= 1) return result.copyFrom(end);

  return start.addScaledO(edge, t, result);
}

// Line.
// Christer Ericson - Real Time Collision Detection.
// @ts-ignore - unused param.
export function planeDistToPoint(position: Vector, normal: Vector, point: Vector, result?: Vector) {
  const t = normal.dot(point.subO(position));
  return t;
}

//
// Segment.
// Christer Ericson - Real Time Collision Detection.
export function segmentSqrDistToPoint(start: Vector, end: Vector, point: Vector) {
  const startToEnd = end.subO(start);
  const startToPoint = point.subO(start);
  const endToPoint = point.subO(end);

  const projection = startToPoint.dot(startToEnd);

  if (projection <= 0) return startToPoint.magSquared;

  const segmentLengthSqr = startToEnd.magSquared;

  if (projection >= segmentLengthSqr) return endToPoint.magSquared;

  return startToPoint.magSquared - projection * projection / segmentLengthSqr;
}

//
// Segment.
// Christer Ericson - Real Time Collision Detection.
// Computes closest points on two segments and returns the squared distance between them.
export function segmentSegmentClosestPoints(
  segment1Start: Vector,
  segment1End: Vector,
  segment2Start: Vector,
  segment2End: Vector,
  segment1Closest: Vector,
  segment2Closest: Vector) {
  const segment1Vector = segment1End.subO(segment1Start); // Direction vector of segment S1
  const segment2Vector = segment2End.subO(segment2Start); // Direction vector of segment S2
  const r = segment1Start.subO(segment2Start);
  const segment1SqrLen = segment1Vector.dot(segment1Vector); // Squared length of segment S1, always nonnegative
  const segment2SqrLen = segment2Vector.dot(segment2Vector); // Squared length of segment S2, always nonnegative
  const f = segment2Vector.dot(r);

  // Check if either or both segments degenerate into points
  if (segment1SqrLen <= EPSILON && segment2SqrLen <= EPSILON) { // Both segments degenerate into points
    segment1Closest.copyFrom(segment1Start);
    segment2Closest.copyFrom(segment2Start);
    return segment1Closest.subO(segment2Closest).dot(segment1Closest.subO(segment2Closest));
  }

  let segment1Scale: number;
  let segment2Scale: number;

  if (segment1SqrLen <= EPSILON) { // First segment degenerates into a point
    segment1Scale = 0;
    segment2Scale = f / segment2SqrLen; // s = 0 => t = (b*s + f) / e = f / e
    segment2Scale = clamp(segment2Scale, 0, 1);
  } else {
    const c = segment1Vector.dot(r);

    if (segment2SqrLen <= EPSILON) { // Second segment degenerates into a point
      segment2Scale = 0;
      segment1Scale = clamp(-c / segment1SqrLen, 0, 1); // t = 0 => s = (b*t - c) / a = -c / a
    } else { // The general nondegenerate case starts here
      const b = segment1Vector.dot(segment2Vector);
      const denom = segment1SqrLen * segment2SqrLen - b * b; // Always nonnegative
      // If segments not parallel, compute closest point on L1 to L2 and
      // clamp to segment S1. Else pick arbitrary s (here 0)
      if (denom !== 0) {
        segment1Scale = clamp((b * f - c * segment2SqrLen) / denom, 0, 1);
      } else
        segment1Scale = 0;
      // Compute point on L2 closest to S1(s) using
      // t = Dot((P1 + D1*s) - P2,D2) / Dot(D2,D2) = (b*s + f) / e
      segment2Scale = (b * segment1Scale + f) / segment2SqrLen;
      // If t in [0,1] done. Else clamp t, recompute s for the new value
      // of t using s = Dot((P2 + D2*t) - P1,D1) / Dot(D1,D1)= (t*b - c) / a
      // and clamp s to [0, 1]
      if (segment2Scale < 0) {
        segment2Scale = 0;
        segment1Scale = clamp(-c / segment1SqrLen, 0, 1);
      } else if (segment2Scale > 1) {
        segment2Scale = 1;
        segment1Scale = clamp((b - c) / segment1SqrLen, 0, 1);
      }
    }
  }

  segment1Start.displaceByScaledO(segment1Vector, segment1Scale, segment1Closest);
  segment2Start.displaceByScaledO(segment2Vector, segment2Scale, segment2Closest);
  return segment1Closest.subO(segment2Closest).dot(segment1Closest.subO(segment2Closest));
}

