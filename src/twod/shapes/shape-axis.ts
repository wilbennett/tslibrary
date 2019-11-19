import { Shape } from '.';
import { Vector } from '../../vectors';

export class ShapeAxis {
  constructor(shape: Shape, normal?: Vector, point?: Vector) {
    this.shape = shape;
    this.normal = normal || Vector.empty;
    this.point = point || Vector.empty;
  }

  shape: Shape;
  normal: Vector;
  _worldNormal?: Vector;
  get worldNormal() {
    if (!this._worldNormal) {
      if (this.point.isEmpty) return Vector.empty;

      this._worldNormal = this.shape.toWorld(this.normal);
    }

    return this._worldNormal;
  }
  set worldNormal(value) { this._worldNormal = value; }
  point: Vector;
  _worldPoint?: Vector;
  get worldPoint() {
    if (!this._worldPoint) {
      if (this.point.isEmpty) return Vector.empty;

      this._worldPoint = this.shape.toWorld(this.point);
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

  toLocalOf(otherShape: Shape, result?: ShapeAxis) {
    const shape = this.shape;

    if (otherShape === shape) {
      if (!result) return this;

      result.clear();
      result.normal = this.normal;
      result.point = this.point;
      result.shape = shape;
      return result;
    }

    result || (result = new ShapeAxis(otherShape));

    result.clear();
    result.normal = shape.toLocalOf(otherShape, this.normal);
    result.point = shape.toLocalOf(otherShape, this.point);
    result.shape = otherShape;
    return result;
  }
}
