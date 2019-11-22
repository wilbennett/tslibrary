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

export function calcPolyArea(vertexList: VectorCollection) {
  const vertices = vertexList.items;
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

export function calcPolyCenterArea(vertexList: VectorCollection, result?: [Vector, number]) {
  const vertices = vertexList.items;
  const vertexCount = vertices.length;

  let area = 0;
  let sum = Vector.direction(0, 0);
  let temp = Vector.create(0, 0);

  for (let i = 0; i < vertexCount; i++) {
    const vertex1 = vertices[i];
    const vertex2 = vertices[(i + 1) % vertexCount];
    const cross = vertex1.cross2D(vertex2);

    area += cross;
    sum = sum.add(vertex1.displaceByO(vertex2, temp).scale(cross));
  }

  area *= 0.5;

  result = result || [Vector.position(0, 0), 0];
  sum.scale(1 / (6 * area)).withWO(1, result[0]);
  result[1] = area;
  return result;
}

export function offsetPoly(vertexList: VectorCollection, offset: Vector) {
  const vertices = vertexList.items;
  const vertexCount = vertices.length;
  const amt = offset.withWO(0);

  for (let i = 0; i < vertexCount; i++) {
    vertices[i].displaceBy(amt);
  }
}

export function movePoly(vertexList: VectorCollection, currentCenter: Vector, newCenter: Vector) {
  offsetPoly(vertexList, newCenter.subO(currentCenter));
}

export function normalizePolyCenter(vertexList: VectorCollection, radiusCenterArea?: [number, Vector, number]) {
  const vertices = vertexList.items;
  const vertexCount = vertices.length;

  const [center, area] = calcPolyCenterArea(vertexList);
  let maxRadius = 0;

  for (let i = 0; i < vertexCount; i++) {
    const vertex = vertices[i].displaceByNeg(center);
    const magSquared = vertex.magSquared;

    if (magSquared > maxRadius) {
      maxRadius = magSquared;
    }
  }

  radiusCenterArea || (radiusCenterArea = [0, Vector.create(), 0]);
  radiusCenterArea[0] = Math.sqrt(maxRadius);
  radiusCenterArea[1] = center;
  radiusCenterArea[2] = area;
  return radiusCenterArea;
}

export function generateRegularPoly(vertexList: VectorCollection, radius: number, startAngle: number = 0) {
  const vertices = vertexList.items;
  const vertexCount = vertices.length;
  const step = 360 * ONE_DEGREE / vertexCount;
  const vector = Vector2D.fromRadians(startAngle, radius, 1); // TODO: Make dimension agnostic.

  for (let i = 0; i < vertexCount; i++) {
    vertices[i].copyFrom(vector);
    vector.rotate(step);
  }

  return calcPolyArea(vertexList);
}

export function generateIrregularPoly(vertexList: VectorCollection, radius: number, startAngle: number = 0) {
  const vertices = vertexList.items;
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

  const [maxRadius, , area] = normalizePolyCenter(vertexList);
  const scale = radius / maxRadius;

  for (i = 0; i < vertexCount; i++) {
    vertices[i].scale(scale);
  }

  return area;
}

export function generatePoly(vertexList: VectorCollection, radius: number, startAngle: number = 0, regular: boolean = true) {
  return regular
    ? generateRegularPoly(vertexList, radius, startAngle)
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
  const area = generatePoly(vertexList, radius, startAngle, regular);
  populatePolyEdgeNormals(groups);
  return area;
}
