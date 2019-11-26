import { ICircle } from '.';
import { MathEx } from '../../core';
import { Vector } from '../../vectors';
import { CircleSegmentInfo, getCircleSegmentInfo } from '../utils';

const { ONE_DEGREE } = MathEx;

export function calcCircleVertices(
  circle: ICircle,
  isWorld: boolean = false,
  circleSegments?: CircleSegmentInfo,
  result?: Vector[]): Vector[] {
  circleSegments || (circleSegments = getCircleSegmentInfo());
  const { segmentCount } = circleSegments;
  result || (result = []);
  result.length = segmentCount;

  const center = isWorld ? circle.position : circle.center;
  let point = Vector.position(center.x + circle.radius, center.y);
  let step = 360 / segmentCount * ONE_DEGREE;

  for (let i = 0; i < segmentCount; i++) {
    result[i] = point;
    point = point.rotateAboutO(center, step);
  }

  return result;
}

export function calcCircleVerticesAndEdges(
  circle: ICircle,
  isWorld: boolean = false,
  circleSegments?: CircleSegmentInfo,
  result?: [Vector[], Vector[]]): [Vector[], Vector[]] {
  circleSegments || (circleSegments = getCircleSegmentInfo());
  const { segmentCount } = circleSegments;
  result || (result = [[], []]);
  const [vertices, edges] = result;
  vertices.length = segmentCount;
  edges.length = segmentCount;

  const center = isWorld ? circle.position : circle.center;
  let point = Vector.position(center.x + circle.radius, center.y);
  let step = 360 / segmentCount * ONE_DEGREE;

  for (let i = 0; i < segmentCount; i++) {
    vertices[i] = point;
    point = point.rotateAboutO(center, step);
    edges[i] = point.subO(vertices[i]);
  }

  return result;
}

export function getCircleVertex(circle: ICircle, index: number, circleSegments?: CircleSegmentInfo) {
  circleSegments || (circleSegments = getCircleSegmentInfo());
  let step = circleSegments.step;
  const rad = step * index;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const x = cos * circle.radius;
  const y = sin * circle.radius;
  return Vector.position(x, y);
}

export function getCircleEdge(circle: ICircle, index: number, circleSegments?: CircleSegmentInfo) {
  circleSegments || (circleSegments = getCircleSegmentInfo());

  const nextIndex = (index + 1) % circleSegments.segmentCount;
  return getCircleVertex(circle, nextIndex, circleSegments).subO(getCircleVertex(circle, index, circleSegments));
}

export function calcCircleIndex(radians: number, circleSegments?: CircleSegmentInfo) {
  circleSegments || (circleSegments = getCircleSegmentInfo());
  return Math.floor(radians / circleSegments.step);
}
