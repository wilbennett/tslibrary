import { Shape } from '.';
import { Vector } from '../../vectors';

export class ShapeAxis {
  constructor(shape: Shape, normal?: Vector, point?: Vector) {
    this.shape = shape;
    this._normal = normal || Vector.empty;
    this._point = point || Vector.empty;
  }

  shape: Shape;
  protected _normal: Vector;
  get normal() {
    if (this._normal.isEmpty) {
      if (!this._worldNormal || this._worldNormal.isEmpty) return Vector.empty;

      this._normal = this.shape.toLocal(this._worldNormal);
    }

    return this._normal;
  }
  set normal(value) { this._normal = value; }
  protected _worldNormal?: Vector;
  get worldNormal() {
    if (!this._worldNormal) {
      if (this._normal.isEmpty) return Vector.empty;

      this._worldNormal = this.shape.toWorld(this._normal);
    }

    return this._worldNormal;
  }
  set worldNormal(value) { this._worldNormal = value; }
  protected _point: Vector;
  get point() {
    if (this._point.isEmpty) {
      if (!this._worldPoint || this._worldPoint.isEmpty) return Vector.empty;

      this._point = this.shape.toLocal(this._worldPoint);
    }

    return this._point;
  }
  set point(value) { this._point = value; }
  protected _worldPoint?: Vector;
  get worldPoint() {
    if (!this._worldPoint) {
      if (this._point.isEmpty) return Vector.empty;

      this._worldPoint = this.shape.toWorld(this._point);
    }

    return this._worldPoint;
  }
  set worldPoint(value) { this._worldPoint = value; }

  clear() {
    this.normal = Vector.empty;
    this._worldNormal = undefined;
    this.point = Vector.empty;
    this._worldPoint = undefined;
  }

  toWorldWithShape(otherShape: Shape, negateNormal: boolean = false, result?: ShapeAxis) {
    const shape = this.shape;

    if (otherShape === shape) {
      if (!result && !negateNormal) return this;

      result || (result = new ShapeAxis(shape));
      result.clear();
      result.worldNormal = negateNormal ? this.worldNormal.negateO() : this.worldNormal;
      result.worldPoint = this.worldPoint;
      result.shape = shape;
      return result;
    }

    result || (result = new ShapeAxis(otherShape));

    result.clear();
    result.worldNormal = negateNormal ? this.worldNormal.negateO() : this.worldNormal;
    result.worldPoint = this.worldPoint;
    result.shape = otherShape;
    return result;
  }

  toLocalOf(otherShape: Shape, negateNormal: boolean = false, result?: ShapeAxis) {
    const shape = this.shape;

    if (otherShape === shape) {
      if (!result && !negateNormal) return this;

      result || (result = new ShapeAxis(shape));
      result.clear();
      result.normal = negateNormal ? this.normal.negateO() : this.normal;
      result.point = this.point;
      result.worldNormal = negateNormal ? this.worldNormal.negateO() : this.worldNormal;
      result.worldPoint = this.worldPoint;
      result.shape = shape;
      return result;
    }

    result || (result = new ShapeAxis(otherShape));

    result.clear();
    result.normal = shape.toLocalOf(otherShape, negateNormal ? this.normal.negateO() : this.normal);
    result.point = shape.toLocalOf(otherShape, this.point);
    result.worldNormal = negateNormal ? this.worldNormal.negateO() : this.worldNormal;
    result.worldPoint = this.worldPoint;
    result.shape = otherShape;
    return result;
  }

  toString() {
    return `Axis: ${this.shape.constructor.name}, ${this.worldNormal}, ${this.worldPoint}`;
  }
}
