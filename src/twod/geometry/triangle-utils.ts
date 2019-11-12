import { ITriangle } from '.';

export function signedTriangleArea(triangle: ITriangle) {
  const vertices = triangle.vertices.items;
  const a = vertices[0];
  const b = vertices[1];
  const c = vertices[2];
  return (a.x - c.x) * (b.y - c.y) - (a.y - c.y) * (b.x - c.x);
}

export function isTriangleCCW(triangle: ITriangle) {
  const vertices = triangle.vertices.items;
  const a = vertices[0];
  const b = vertices[1];
  const c = vertices[2];
  const signedArea = (a.x - c.x) * (b.y - c.y) - (a.y - c.y) * (b.x - c.x);
  return signedArea >= 0;
}
