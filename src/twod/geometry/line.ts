import { GeometryBase, ILine } from '.';
import { Viewport } from '..';
import { Vector } from '../../vectors';

export class Line extends GeometryBase implements ILine {
  kind: "line" = "line";

  constructor(point: Vector, direction: Vector) {
    super();

    this.point = point;
    this.direction = direction;
  }

  protected _point!: Vector;
  get point() { return this._point; }
  set point(value) {
    if (!value.isPosition)
      value = value.asPosition();

    this._point = value;
  }

  protected _direction!: Vector;
  get direction() { return this._direction; }
  set direction(value) {
    if (!value.isDirection)
      value = value.asDirection();

    this._direction = value.normalize();
  }

  protected renderCore(viewport: Viewport) {
    const mag = viewport.viewBounds.max.subN(viewport.viewBounds.min).magSquared;
    const dir = this.direction.scaleN(mag);
    const point1 = this.point.displaceByN(dir);
    const point2 = this.point.displaceByN(dir.negate());

    viewport.ctx.beginPath().line(point1, point2).stroke();
  }
}
