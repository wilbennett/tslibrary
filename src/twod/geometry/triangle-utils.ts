import { ITriangle } from '.';
import { Vector } from '../../vectors';

// Christer Ericson - Real Time Collision Detection.
export function signedTriArea(a: Vector, b: Vector, c: Vector) {
  return (a.x - c.x) * (b.y - c.y) - (a.y - c.y) * (b.x - c.x);
}

export function signedGeoTriArea(triangle: ITriangle) {
  const a = triangle.a;
  const b = triangle.b;
  const c = triangle.c;
  return (a.x - c.x) * (b.y - c.y) - (a.y - c.y) * (b.x - c.x);
}

export function isTriCCW(a: Vector, b: Vector, c: Vector) {
  const signedArea = (a.x - c.x) * (b.y - c.y) - (a.y - c.y) * (b.x - c.x);
  return signedArea >= 0;
}

export function isGeoTriCCW(triangle: ITriangle) {
  const a = triangle.a;
  const b = triangle.b;
  const c = triangle.c;
  const signedArea = (a.x - c.x) * (b.y - c.y) - (a.y - c.y) * (b.x - c.x);
  return signedArea >= 0;
}
