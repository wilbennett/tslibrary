import { MathEx } from '../../core';
import { Vector, Vector2D, VectorCollection, VectorGroups } from '../../vectors';

const { ONE_DEGREE } = MathEx;

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
  let sum = Vector.createDirection(0, 0);
  let temp = Vector.create(0, 0);

  for (let i = 0; i < vertexCount; i++) {
    const vertex1 = vertices[i];
    const vertex2 = vertices[(i + 1) % vertexCount];
    const cross = vertex1.cross2D(vertex2);

    area += cross;
    sum = sum.add(vertex1.displaceByO(vertex2, temp).scale(cross));
  }

  area *= 0.5;

  result = result || [Vector.createPosition(0, 0), 0];
  sum.scale(1 / (6 * area)).withWO(1, result[0]);
  result[1] = area;
  return result;
}

export function offsetPoly(vertexList: VectorCollection, offset: Vector) {
  const vertices = vertexList.items;
  const vertexCount = vertices.length;
  const amt = offset.withWN(0);

  for (let i = 0; i < vertexCount; i++) {
    vertices[i].displaceBy(amt);
  }
}

export function movePoly(vertexList: VectorCollection, currentCenter: Vector, newCenter: Vector) {
  offsetPoly(vertexList, newCenter.subN(currentCenter));
}

export function normalizePolyCenter(vertexList: VectorCollection, areaMaxRadius?: [number, number]) {
  const vertices = vertexList.items;
  const vertexCount = vertices.length;

  const [center, area] = calcPolyCenterArea(vertexList);
  center.withW(0);
  let max = 0;

  for (let i = 0; i < vertexCount; i++) {
    const vertex = vertices[i].sub(center);
    const magSquared = vertex.magSquared;

    if (magSquared > max) {
      max = magSquared;
    }
  }

  areaMaxRadius = areaMaxRadius || [0, 0];
  areaMaxRadius[0] = area;
  areaMaxRadius[1] = Math.sqrt(max);
  return areaMaxRadius;
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
  let center = Vector.createPosition(0, 0);
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

  const [area, maxRadius] = normalizePolyCenter(vertexList);
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
