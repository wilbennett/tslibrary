import { AABBShape, ICircleShape, SupportPoint, SupportPointImpl } from '.';
import { calcCircleIndex } from '..';
import { dir, pos, Vector } from '../../vectors';
import { CircleSegmentInfo, getCircleSegmentInfo } from '../utils';

export function calcCircleSupport(
  circle: ICircleShape,
  direction: Vector,
  segments?: CircleSegmentInfo,
  result?: SupportPoint): SupportPoint {
  if (direction.magSquared !== 1)
    direction = direction.normalizeO();

  const point = direction.scaleO(circle.radius).asPosition();

  result || (result = new SupportPointImpl(circle));
  result.clear();
  result.shape = circle;
  result.point = point;
  result.index = calcCircleIndex(direction.radians, segments);
  result.distance = point.dot(direction);
  return result;
}

export function calcCircleVertices(
  circle: ICircleShape,
  isWorld: boolean = false,
  circleSegments?: CircleSegmentInfo,
  result?: Vector[]): Vector[] {
  circleSegments || (circleSegments = getCircleSegmentInfo());
  const { segmentCount, cos, sin } = circleSegments;
  result || (result = []);
  result.length = segmentCount;

  const center = isWorld ? circle.position : circle.center;
  let offset = Vector.direction(circle.radius, 0);
  isWorld && offset.rotate(circle.angle);

  for (let i = 0; i < segmentCount; i++) {
    result[i] = center.displaceByO(offset);
    let x = offset.x;
    let y = offset.y;
    let rx = x * cos - y * sin;
    let ry = x * sin + y * cos;
    offset.withXY(rx, ry);
  }

  return result;
}

export function calcCircleVerticesAndEdges(
  circle: ICircleShape,
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
  let offset = Vector.direction(circle.radius, 0);
  isWorld && offset.rotate(circle.angle);

  for (let i = 0; i < segmentCount; i++) {
    vertices[i] = center.displaceByO(offset);

    let x = offset.x;
    let y = offset.y;
    let rx = x * cos - y * sin;
    let ry = x * sin + y * cos;
    offset.withXY(rx, ry);
    edges[i] = center.displaceByO(offset).sub(vertices[i]);
  }

  return result;
}

export function getCircleVertex(circle: ICircleShape, index: number, isWorld: boolean = false, circleSegments?: CircleSegmentInfo) {
  circleSegments || (circleSegments = getCircleSegmentInfo());
  const center = isWorld ? circle.position : circle.center;
  const rad = circleSegments.step * index + (isWorld ? circle.angle : 0);
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const x = cos * circle.radius;
  const y = sin * circle.radius;
  return Vector.position(x + center.x, y + center.y);
}

export function getCircleEdge(circle: ICircleShape, index: number, isWorld: boolean = false, circleSegments?: CircleSegmentInfo) {
  circleSegments || (circleSegments = getCircleSegmentInfo());

  const nextIndex = (index + 1) % circleSegments.segmentCount;

  return getCircleVertex(circle, nextIndex, isWorld, circleSegments)
    .subO(getCircleVertex(circle, index, isWorld, circleSegments));
}

export function createWalls(position: Vector, size: Vector, wallThickness: number) {
  const halfSize = size.scaleO(0.5);
  const halfWallThickness = wallThickness * 0.5;
  const offset = dir(halfSize.x + halfWallThickness, 0);
  const temp = pos(0, 0);

  let halfWallSize = dir(halfWallThickness, halfSize.y);
  let wpos = position.addO(offset, temp);
  const rightWall = new AABBShape(halfWallSize.clone());
  rightWall.setPosition(wpos);

  wpos = position.addO(offset.negateO(temp), temp);
  const leftWall = new AABBShape(halfWallSize);
  leftWall.setPosition(wpos);

  offset.withXY(0, halfSize.y + halfWallThickness);
  halfWallSize = dir(halfSize.x + wallThickness, halfWallThickness);
  wpos = position.addO(offset, temp);
  const topWall = new AABBShape(halfWallSize.clone());
  topWall.setPosition(wpos);

  wpos = position.addO(offset.negateO(temp), temp);
  const bottomWall = new AABBShape(halfWallSize);
  bottomWall.setPosition(wpos);

  return [leftWall, bottomWall, rightWall, topWall];
}
