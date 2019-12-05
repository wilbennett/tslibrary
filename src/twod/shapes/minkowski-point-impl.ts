import { MinkowskiPoint, Shape, SupportPoint, SupportPointImpl } from '.';
import { Vector } from '../../vectors';
import { getCircleVertex } from '../geometry';
import { CircleSegmentInfo, getCircleSegmentInfo } from '../utils';

const ZERO_DIRECTION = Vector.direction(0, 0);

export class MinkowskiPointImpl extends SupportPointImpl implements MinkowskiPoint {
  constructor(
    public shapeA: Shape,
    public shapeB: Shape,
    point: Vector,
    indexA: number,
    indexB: number,
    worldDirection: Vector = ZERO_DIRECTION,
    circleSegments?: CircleSegmentInfo) {
    super(shapeA, point);

    this._worldPoint = point;
    this._indexA = indexA;
    this._indexB = indexB;
    this.worldDirection = worldDirection;
    this.circleSegments = circleSegments || getCircleSegmentInfo();
  }

  circleSegments: CircleSegmentInfo;
  protected _isSum?: boolean;
  get isSum() { return !!this._isSum; }
  set isSum(value) { this._isSum = value; }

  protected _indexA: number;
  get indexA() { return this._indexA; }
  set indexA(value) { this._indexA = value; }
  protected _indexB: number;
  get indexB() { return this._indexB; }
  set indexB(value) { this._indexB = value; }

  get worldPoint() {
    return this._worldPoint || (this._worldPoint = this.point);
  }
  set worldPoint(value) {
    this._worldPoint = value;
    this.point = value;
  }

  get pointA() {
    return this.shapeA.kind === "circle"
      ? getCircleVertex(this.shapeA, this.indexA, false, this.circleSegments)
      : this.shapeA.getVertex(this.indexA);
  }

  get pointB() {
    return this.shapeB.kind === "circle"
      ? getCircleVertex(this.shapeB, this.indexB, false, this.circleSegments)
      : this.shapeB.getVertex(this.indexB);
  }

  protected _worldPointA?: Vector;
  get worldPointA() {
    if (!this._worldPointA) {
      this._worldPointA = this.shapeA.toWorld(this.pointA);
    }

    return this._worldPointA;
  }
  set worldPointA(value) { this._worldPointA = value; }

  protected _worldPointB?: Vector;
  get worldPointB() {
    if (!this._worldPointB) {
      this._worldPointB = this.shapeB.toWorld(this.pointB);
    }

    return this._worldPointB;
  }
  set worldPointB(value) { this._worldPointB = value; }

  get direction() {
    if (!this._direction) {
      this._direction = this._worldDirection || Vector.empty;
    }

    return this._direction;
  }
  set direction(value) {
    this._direction = value;
    this._worldDirection = value;
  }

  get worldDirection() {
    if (!this._worldDirection) {
      this._worldDirection = this._direction || Vector.empty;
    }

    return this._worldDirection;
  }
  set worldDirection(value) {
    this._worldDirection = value;
    this._direction = value;
  }

  get directionA() { return this.shapeA.toLocal(this.worldDirection); }
  set directionA(value) { this._worldDirection = this.shapeA.toWorld(value); }

  get directionB() {
    return this.isSum
      ? this.shapeB.toLocal(this.worldDirection)
      : this.shapeB.toLocal(this.worldDirection.negateO());
  }
  set directionB(value) {
    this._worldDirection = this.isSum
      ? this.shapeB.toWorld(value)
      : this.shapeB.toWorld(value.negateO());
  }

  clear() {
    super.clear();
    this._worldPointA = undefined;
    this._worldPointB = undefined;

    if (this.isSum)
      this._isSum = undefined;
  }

  adjustDiffPointIfCircle() {
    if (this.shapeA.kind !== "circle" && this.shapeB.kind !== "circle") return;

    this._worldPointA = undefined;
    this._worldPointB = undefined;
    this._worldPoint = this.worldPointA.displaceByNegO(this.worldPointB, this._worldPoint);
  }

  clone(result?: SupportPoint | MinkowskiPoint): SupportPoint | MinkowskiPoint {
    if (!result) {
      result = new MinkowskiPointImpl(this.shapeA, this.shapeB, this.point.clone(), this.indexA, this.indexB);
    } else {
      if (result instanceof MinkowskiPointImpl) {
        result.shapeA = this.shapeA;
        result.shapeB = this.shapeB;
        result.indexA = this.indexA;
        result.indexB = this.indexB;
      }
    }

    super.clone(result);

    if (result instanceof MinkowskiPointImpl) {
      result.circleSegments = this.circleSegments;

      if (this.isSum)
        result._isSum = this.isSum;

      if (this._worldPointA)
        result._worldPointA = this._worldPointA.clone();

      if (this._worldPointB)
        result._worldPointB = this._worldPointB.clone();
    }

    return result;
  }
};
