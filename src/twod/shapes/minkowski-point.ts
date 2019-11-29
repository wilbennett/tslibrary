import { Shape, SupportPoint } from '.';
import { Vector } from '../../vectors';
import { CircleSegmentInfo } from '../utils';

export interface MinkowskiPoint extends SupportPoint {
  shapeA: Shape;
  shapeB: Shape;
  circleSegments: CircleSegmentInfo;
  isSum: boolean;
  indexA: number;
  indexB: number;
  pointA: Vector;
  pointB: Vector;
  worldPointA: Vector;
  worldPointB: Vector;
  directionA: Vector;
  directionB: Vector;

  adjustDiffPointIfCircle(): void;
}
