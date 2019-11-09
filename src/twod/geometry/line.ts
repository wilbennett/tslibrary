import { GeometryBase, ILine } from '.';
import { ContextProps, Viewport } from '..';
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

  // @ts-ignore - unused param.
  protected renderCore(view: Viewport, props: ContextProps) {
    const mag = view.viewBounds.max.subN(view.viewBounds.min).magSquared;
    const dir = this.direction.scaleN(mag);
    const start = this.point.displaceByN(dir);
    const end = this.point.displaceByN(dir.negate());

    view.ctx.beginPath().line(start, end).stroke();
  }
}
