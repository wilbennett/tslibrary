import { ITriangle } from '.';
import { Vector } from '../../vectors';

export function signedTriangleArea(a: Vector, b: Vector, c: Vector) {
  return (a.x - c.x) * (b.y - c.y) - (a.y - c.y) * (b.x - c.x);
}

export function signedGeoTriangleArea(triangle: ITriangle) {
  const vertices = triangle.vertexList.items;
  const a = vertices[0];
  const b = vertices[1];
  const c = vertices[2];
  return (a.x - c.x) * (b.y - c.y) - (a.y - c.y) * (b.x - c.x);
}

export function isTriangleCCW(a: Vector, b: Vector, c: Vector) {
  const signedArea = (a.x - c.x) * (b.y - c.y) - (a.y - c.y) * (b.x - c.x);
  return signedArea >= 0;

  // https://www.toptal.com/python/computational-geometry-in-python-from-theory-to-implementation
  // return (b.x - a.x) * (c.y - a.y) > (b.y - a.y) * (c.x - a.x);
}

export function isTriangleCW(a: Vector, b: Vector, c: Vector) {
  const signedArea = (a.x - c.x) * (b.y - c.y) - (a.y - c.y) * (b.x - c.x);
  return signedArea <= 0;
}

export function isGeoTriangleCCW(triangle: ITriangle) {
  const vertices = triangle.vertexList.items;
  const a = vertices[0];
  const b = vertices[1];
  const c = vertices[2];
  const signedArea = (a.x - c.x) * (b.y - c.y) - (a.y - c.y) * (b.x - c.x);
  return signedArea >= 0;

  // https://www.toptal.com/python/computational-geometry-in-python-from-theory-to-implementation
  // return (b.x - a.x) * (c.y - a.y) > (b.y - a.y) * (c.x - a.x);
}
