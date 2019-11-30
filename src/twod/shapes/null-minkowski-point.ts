import { MinkowskiPoint, NullSupportPoint, SupportPoint } from '.';
import { getCircleSegmentInfo } from '../utils';

export class NullMinkowskiPoint extends NullSupportPoint implements MinkowskiPoint {
  static instance = new NullMinkowskiPoint();
  get shapeA() { return this.shape; }
  get shapeB() { return this.shape; }
  get circleSegments() { return getCircleSegmentInfo(); }
  get isSum() { return true; }
  get indexA() { return NaN; }
  // @ts-ignore - unused param.
  set indexA(value) { }
  get indexB() { return NaN; }
  // @ts-ignore - unused param.
  set indexB(value) { }
  get worldPoint() { return this.point; }
  // @ts-ignore - unused param.
  set worldPoint(value) { }
  get pointA() { return this.point; }
  get pointB() { return this.point; }
  get worldPointA() { return this.point; }
  // @ts-ignore - unused param.
  set worldPointA(value) { }
  get worldPointB() { return this.point; }
  // @ts-ignore - unused param.
  set worldPointB(value) { }
  get direction() { return this.point; }
  // @ts-ignore - unused param.
  set direction(value) { }
  get worldDirection() { return this.point; }
  // @ts-ignore - unused param.
  set worldDirection(value) { }
  get directionA() { return this.point; }
  // @ts-ignore - unused param.
  set directionA(value) { }
  get directionB() { return this.point; }
  // @ts-ignore - unused param.
  set directionB(value) { }

  adjustDiffPointIfCircle() { }
  clone(result?: SupportPoint | MinkowskiPoint): SupportPoint | MinkowskiPoint { return result ? result : this; }
};
