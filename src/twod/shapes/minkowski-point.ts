import { Shape, SupportPoint } from '.';
import { Vector } from '../../vectors';
import { getCircleVertex } from '../geometry';

const ZERO_DIRECTION = Vector.direction(0, 0);

export class MinkowskiPoint extends SupportPoint {
  constructor(
    public shapeA: Shape,
    public shapeB: Shape,
    point: Vector,
    public indexA: number,
    public indexB: number,
    worldDirection: Vector = ZERO_DIRECTION) {
    super(shapeA, point);

    this._worldPoint = point;
    this.worldDirection = worldDirection;
  }

  isSum?: boolean;

  get worldPoint() {
    return this._worldPoint || (this._worldPoint = this.point);
  }
  set worldPoint(value) {
    this._worldPoint = value;
    this.point = value;
  }

  get pointA() {
    return this.shapeA.kind === "circle"
      ? getCircleVertex(this.shapeA, this.indexA)
      : this.shapeA.vertexList.items[this.indexA];
  }

  get pointB() {
    return this.shapeB.kind === "circle"
      ? getCircleVertex(this.shapeB, this.indexB)
      : this.shapeB.vertexList.items[this.indexB];
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
      this.isSum = undefined;
  }

  clone(result?: SupportPoint | MinkowskiPoint): SupportPoint | MinkowskiPoint {
    if (!result) {
      result = new MinkowskiPoint(this.shapeA, this.shapeB, this.point, this.indexA, this.indexB);
    } else {
      if (result instanceof MinkowskiPoint) {
        result.shapeA = this.shapeA;
        result.shapeB = this.shapeB;
        result.indexA = this.indexA;
        result.indexB = this.indexB;
      }
    }

    super.clone(result);

    if (result instanceof MinkowskiPoint) {
      if (this.isSum)
        result.isSum = this.isSum;

      if (this._worldPointA)
        result._worldPointA = this._worldPointA.clone();

      if (this._worldPointB)
        result._worldPointB = this._worldPointB.clone();
    }

    return result;
  }
};
