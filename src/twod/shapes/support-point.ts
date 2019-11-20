import { Shape } from '.';
import { Vector } from '../../vectors';

export class SupportPoint {
  constructor(public shape: Shape, point?: Vector, worldPoint?: Vector, index?: number, distance?: number) {
    this.point = point || Vector.empty;

    if (worldPoint)
      this._worldPoint = worldPoint;

    this.index = index !== undefined ? index : -1;
    this.distance = distance || 0;
  }

  point: Vector;
  protected _worldPoint?: Vector;
  get worldPoint() {
    if (!this._worldPoint) {
      if (this.point.isEmpty) return Vector.empty;

      this._worldPoint = this.shape.toWorld(this.point);
    }

    return this._worldPoint;
  }
  set worldPoint(value) { this._worldPoint = value; }
  index: number;
  distance: number;
  get isValid() { return !this.point.isEmpty; }

  clear() {
    this.point = Vector.empty;
    this._worldPoint = undefined;
    this.index = -1;
    this.distance = 0;
  }
}
