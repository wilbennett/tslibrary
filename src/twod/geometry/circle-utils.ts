export { };
/*
import { ICircle } from '.';
import { pos, Vector } from '../../vectors';
import { CircleSegmentInfo, getCircleSegmentInfo } from '../shapes';

export function calcCircleVertices(
  circle: ICircle,
  isWorld: boolean = false,
  circleSegments?: CircleSegmentInfo,
  result?: Vector[]): Vector[] {
  circleSegments || (circleSegments = getCircleSegmentInfo());
  const { segmentCount, cos, sin } = circleSegments;
  result || (result = []);
  result.length = segmentCount;

  const center = isWorld ? circle.position : circle.center;
  const cx = center.x;
  const cy = center.y;
  let point = Vector.position(cx + circle.radius, cy);

  for (let i = 0; i < segmentCount; i++) {
    result[i] = point;
    let x = point.x - cx;
    let y = point.y - cy;
    let rx = x * cos - y * sin;
    let ry = x * sin + y * cos;
    point = pos(rx + cx, ry + cy);
  }

  return result;
}

export function calcCircleVerticesAndEdges(
  circle: ICircle,
  isWorld: boolean = false,
  circleSegments?: CircleSegmentInfo,
  result?: [Vector[], Vector[]]): [Vector[], Vector[]] {
  circleSegments || (circleSegments = getCircleSegmentInfo());
  const { segmentCount, cos, sin } = circleSegments;
  result || (result = [[], []]);
  const [vertices, edges] = result;
  vertices.length = segmentCount;
  edges.length = segmentCount;

  const center = isWorld ? circle.position : circle.center;
  const cx = center.x;
  const cy = center.y;
  let point = Vector.position(cx + circle.radius, cy);

  for (let i = 0; i < segmentCount; i++) {
    vertices[i] = point;

    let x = point.x - cx;
    let y = point.y - cy;
    let rx = x * cos - y * sin;
    let ry = x * sin + y * cos;

    point = pos(rx + cx, ry + cy);
    edges[i] = point.subO(vertices[i]);
  }

  return result;
}

export function getCircleVertex(circle: ICircle, index: number, isWorld: boolean = false, circleSegments?: CircleSegmentInfo) {
  circleSegments || (circleSegments = getCircleSegmentInfo());
  const center = isWorld ? circle.position : circle.center;
  const rad = circleSegments.step * index;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const x = cos * circle.radius;
  const y = sin * circle.radius;
  return Vector.position(x + center.x, y + center.y);
}

export function getCircleEdge(circle: ICircle, index: number, isWorld: boolean = false, circleSegments?: CircleSegmentInfo) {
  circleSegments || (circleSegments = getCircleSegmentInfo());

  const nextIndex = (index + 1) % circleSegments.segmentCount;

  return getCircleVertex(circle, nextIndex, isWorld, circleSegments)
    .subO(getCircleVertex(circle, index, isWorld, circleSegments));
}

export function calcCircleIndex(radians: number, circleSegments?: CircleSegmentInfo) {
  circleSegments || (circleSegments = getCircleSegmentInfo());
  return Math.floor(radians / circleSegments.step);
}
//*/
