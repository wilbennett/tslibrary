import { isTriangleCW } from '.';
import { MathEx } from '../../core';
import { Vector, Vector2D, VectorCollection, VectorGroups } from '../../vectors';

const { ONE_DEGREE } = MathEx;

// Andrew's Algorithm: https://en.wikibooks.org/wiki/Algorithm_Implementation/Geometry/Convex_hull/Monotone_chain
export function convexHull(vertices: Vector[]) {
  const count = vertices.length;
  vertices.sort((a, b) => a.x == b.x ? a.y - b.y : a.x - b.x);

  const lower = [];

  for (let i = 0; i < count; i++) {
    let len = lower.length;

    while (len >= 2 && isTriangleCW(lower[len - 2], lower[len - 1], vertices[i])) {
      lower.pop();
      len--;
    }

    lower.push(vertices[i]);
  }

  const upper = [];

  for (let i = count - 1; i >= 0; i--) {
    let len = upper.length;

    while (len >= 2 && isTriangleCW(upper[len - 2], upper[len - 1], vertices[i])) {
      upper.pop();
      len--;
    }

    upper.push(vertices[i]);
  }

  upper.pop();
  lower.pop();
  return lower.concat(upper);
}

export function calcPolyArea(vertexList: Vector[]): number;
export function calcPolyArea(vertexList: VectorCollection): number;
export function calcPolyArea(vertexList: Vector[] | VectorCollection) {
  const vertices = Array.isArray(vertexList) ? vertexList : vertexList.items;
  const vertexCount = vertices.length;

  let area = 0;

  for (let i = 0; i < vertexCount; i++) {
    const vertex1 = vertices[i];
    const vertex2 = vertices[(i + 1) % vertexCount];
    const cross = vertex1.cross2D(vertex2);

    area += cross;
  }

  area *= 0.5;
  return area;
}

export function calcPolyCenterAreaInertia(vertexList: Vector[], result?: [Vector, number, number]): [Vector, number, number];
export function calcPolyCenterAreaInertia(vertexList: VectorCollection, result?: [Vector, number, number]): [Vector, number, number];
export function calcPolyCenterAreaInertia(vertexList: Vector[] | VectorCollection, result?: [Vector, number, number]) {
  const vertices = Array.isArray(vertexList) ? vertexList : vertexList.items;
  const vertexCount = vertices.length;

  const oneThird = 1 / 3;
  let area = 0;
  let inertia = 0;
  let sum = Vector.direction(0, 0);
  let temp = Vector.create(0, 0);

  for (let i = 0; i < vertexCount; i++) {
    const vertex1 = vertices[i];
    const vertex2 = vertices[(i + 1) % vertexCount];
    const cross = vertex1.cross2D(vertex2);

    area += cross;
    sum = sum.add(vertex1.displaceByO(vertex2, temp).scale(cross));

    const x = vertex1.x * vertex1.x + vertex2.x * vertex1.x + vertex2.x * vertex2.x;
    const y = vertex1.y * vertex1.y + vertex2.y * vertex1.y + vertex2.y * vertex2.y;
    inertia += (0.25 * oneThird * cross) * (x + y);
  }

  area *= 0.5;

  result = result || [Vector.position(0, 0), 0, 0];
  sum.scale(1 / (6 * area)).withWO(1, result[0]);
  result[1] = area;
  result[2] = inertia;
  return result;
}

export function calcPolyRadius(vertexList: Vector[], center: Vector): number;
export function calcPolyRadius(vertexList: VectorCollection, center: Vector): number;
export function calcPolyRadius(vertexList: Vector[] | VectorCollection, center: Vector) {
  const vertices = Array.isArray(vertexList) ? vertexList : vertexList.items;
  const vertexCount = vertices.length;

  const vertex = Vector.create();
  let radiusSquared = 0;

  for (let i = 0; i < vertexCount; i++) {
    vertices[i].displaceByNegO(center, vertex);
    const magSquared = vertex.magSquared;

    if (magSquared > radiusSquared) {
      radiusSquared = magSquared;
    }
  }

  return Math.sqrt(radiusSquared);
}

export function offsetPoly(vertexList: Vector[], offset: Vector): void;
export function offsetPoly(vertexList: VectorCollection, offset: Vector): void;
export function offsetPoly(vertexList: Vector[] | VectorCollection, offset: Vector) {
  const vertices = Array.isArray(vertexList) ? vertexList : vertexList.items;
  const vertexCount = vertices.length;
  const amt = offset.withWO(0);

  for (let i = 0; i < vertexCount; i++) {
    vertices[i].displaceBy(amt);
  }
}

export function movePoly(vertexList: Vector[], currentCenter: Vector, newCenter: Vector): void;
export function movePoly(vertexList: VectorCollection, currentCenter: Vector, newCenter: Vector): void;
export function movePoly(vertexList: Vector[] | VectorCollection, currentCenter: Vector, newCenter: Vector) {
  // @ts-ignore - no matching overload.
  offsetPoly(vertexList, newCenter.subO(currentCenter));
}

export function normalizePolyCenter(vertexList: Vector[], radiusCenterAreaInertia?: [number, Vector, number, number]): [number, Vector, number, number];
export function normalizePolyCenter(vertexList: VectorCollection, radiusCenterAreaInertia?: [number, Vector, number, number]): [number, Vector, number, number];
export function normalizePolyCenter(vertexList: Vector[] | VectorCollection, radiusCenterAreaInertia?: [number, Vector, number, number]) {
  const vertices = Array.isArray(vertexList) ? vertexList : vertexList.items;
  const vertexCount = vertices.length;

  const [center, area, inertia] = calcPolyCenterAreaInertia(vertices);
  let maxRadius = 0;

  for (let i = 0; i < vertexCount; i++) {
    const vertex = vertices[i].displaceByNeg(center);
    const magSquared = vertex.magSquared;

    if (magSquared > maxRadius) {
      maxRadius = magSquared;
    }
  }

  radiusCenterAreaInertia || (radiusCenterAreaInertia = [0, Vector.create(), 0, 0]);
  radiusCenterAreaInertia[0] = Math.sqrt(maxRadius);
  radiusCenterAreaInertia[1] = center;
  radiusCenterAreaInertia[2] = area;
  radiusCenterAreaInertia[3] = inertia;
  return radiusCenterAreaInertia;
}

export function generateRegularPoly(vertexList: Vector[], radius: number, startAngle?: number): Vector[];
export function generateRegularPoly(vertexList: VectorCollection, radius: number, startAngle?: number): Vector[];
export function generateRegularPoly(vertexList: Vector[] | VectorCollection, radius: number, startAngle: number = 0): Vector[] {
  const vertices = Array.isArray(vertexList) ? vertexList : vertexList.items;
  const vertexCount = vertices.length;
  const step = 360 * ONE_DEGREE / vertexCount;
  const vector = Vector2D.fromRadians(startAngle, radius, 1); // TODO: Make dimension agnostic.

  for (let i = 0; i < vertexCount; i++) {
    vertices[i].copyFrom(vector);
    vector.rotate(step);
  }

  return vertices;
}

export function generateIrregularPoly(vertexList: Vector[], radius: number, startAngle?: number): Vector[];
export function generateIrregularPoly(vertexList: VectorCollection, radius: number, startAngle?: number): Vector[];
export function generateIrregularPoly(vertexList: Vector[] | VectorCollection, radius: number, startAngle: number = 0): Vector[] {
  const vertices = Array.isArray(vertexList) ? vertexList : vertexList.items;
  const vertexCount = vertices.length;

  const minAngle = 5;
  let adv = 360 / vertexCount;
  let remain = 360;
  let i = vertexCount;
  let index = 0;
  let center = Vector.position(0, 0);
  let point = Vector2D.fromRadians(startAngle, radius, 1);

  while (remain > 0 && i > 0) {
    const min = Math.min(remain, minAngle);
    const max = remain - i * minAngle;
    adv = MathEx.randomInt(min, max);

    vertices[index].copyFrom(point);
    center.add(point);
    point.rotate(adv * ONE_DEGREE);
    remain -= adv;
    i--;
    index++;
  }

  const [maxRadius] = normalizePolyCenter(vertices);
  const scale = radius / maxRadius;

  for (i = 0; i < vertexCount; i++) {
    vertices[i].scale(scale);
  }

  return vertices;
}

export function generatePoly(vertexList: Vector[], radius: number, startAngle?: number, regular?: boolean): Vector[];
export function generatePoly(vertexList: VectorCollection, radius: number, startAngle?: number, regular?: boolean): Vector[];
export function generatePoly(vertexList: Vector[] | VectorCollection, radius: number, startAngle: number = 0, regular: boolean = true): Vector[] {
  return regular
    // @ts-ignore - no matching overload.
    ? generateRegularPoly(vertexList, radius, startAngle)
    // @ts-ignore - no matching overload.
    : generateIrregularPoly(vertexList, radius, startAngle);
}

export function populatePolyEdgeNormals(groups: VectorGroups) {
  const vertices = groups.get("vertex").items;
  const edges = groups.get("edge").items;
  const normals = groups.get("normal").items;

  const length = vertices.length;

  for (let i = 0; i < length; i++) {
    let next = (i + 1) % length;
    const edge = edges[i];
    vertices[next].subO(vertices[i], edge);
    edge.perpRightO(normals[i]).normalize();
  }
}

export function populatePolyData(
  groups: VectorGroups,
  radius: number,
  startAngle: number = 0,
  regular: boolean = true) {
  const vertexList = groups.get("vertex");
  generatePoly(vertexList, radius, startAngle, regular);
  populatePolyEdgeNormals(groups);
}
