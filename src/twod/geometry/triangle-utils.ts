import { ITriangle } from '.';

export function signedTriangleArea(triangle: ITriangle) {
  const a = triangle.a;
  const b = triangle.b;
  const c = triangle.c;
  return (a.x - c.x) * (b.y - c.y) - (a.y - c.y) * (b.x - c.x);
}

export function isTriangleCCW(triangle: ITriangle) {
  const a = triangle.a;
  const b = triangle.b;
  const c = triangle.c;
  const signedArea = (a.x - c.x) * (b.y - c.y) - (a.y - c.y) * (b.x - c.x);
  return signedArea >= 0;
}
