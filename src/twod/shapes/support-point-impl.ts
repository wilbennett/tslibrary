import { Shape, SupportPoint } from '.';
import { Vector } from '../../vectors';

export class SupportPointImpl implements SupportPoint {
  constructor(public shape: Shape, point?: Vector, worldPoint?: Vector, index?: number, distance?: number) {
    this._point = point || Vector.empty;

    if (worldPoint)
      this._worldPoint = worldPoint;

    this.index = index !== undefined ? index : NaN;
    this.distance = distance !== undefined ? distance : NaN;
  }

  protected _point?: Vector;
  get point() {
    if (!this._point || this._point.isEmpty) {
      if (!this._worldPoint || this._worldPoint.isEmpty) return Vector.empty;

      this._point = this.shape.toLocal(this.worldPoint);
    }

    return this._point;
  }
  set point(value) { this._point = value; }
  protected _worldPoint?: Vector;
  get worldPoint() {
    if (!this._worldPoint || this._worldPoint.isEmpty) {
      if (this.point.isEmpty) return Vector.empty;

      this._worldPoint = this.shape.toWorld(this.point);
    }

    return this._worldPoint;
  }
  set worldPoint(value) { this._worldPoint = value; }

  protected _direction?: Vector;
  get direction() {
    if (!this._direction || this._direction.isEmpty) {
      if (!this._worldDirection || this._worldDirection.isEmpty) return Vector.empty;

      this._direction = this.shape.toLocal(this._worldDirection);
    }

    return this._direction;
  }
  set direction(value) { this._direction = value; }

  protected _worldDirection?: Vector;
  get worldDirection() {
    if (!this._worldDirection || this._worldDirection.isEmpty) {
      if (!this._direction || this._direction.isEmpty) return Vector.empty;

      this._worldDirection = this.shape.toWorld(this._direction);
    }

    return this._worldDirection;
  }
  set worldDirection(value) { this._worldDirection = value; }

  index: number;
  distance: number;
  get isValid() {
    const havePoint = !!this._point && !this.point.isEmpty;
    const haveWorldPoint = !!this._worldPoint && !this._worldPoint.isEmpty;
    return this.shape && (havePoint || haveWorldPoint);
  }

  clear() {
    this.point = Vector.empty;
    this.index = NaN;
    this.distance = NaN;

    if (this._worldPoint)
      this._worldPoint = undefined;

    if (this._direction)
      this._direction = undefined;

    if (this._worldDirection)
      this._worldDirection = undefined;
  }

  clone(result?: SupportPoint): SupportPoint {
    result || (result = new SupportPointImpl(this.shape));
    result.point = this.point.clone();
    result.index = this.index;
    result.distance = this.distance;
    result.worldPoint = Vector.empty;
    result.direction = Vector.empty;
    result.worldDirection = Vector.empty;

    if (this._worldPoint)
      result.worldPoint = this._worldPoint.clone();

    if (this._direction)
      result.direction = this._direction.clone();

    if (this._worldDirection)
      result.worldDirection = this._worldDirection.clone();

    return result;
  }
}
