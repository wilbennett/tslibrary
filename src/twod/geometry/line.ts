import { GeometryBase, ILine } from '.';
import { ContextProps, Viewport } from '..';
import { Vector } from '../../vectors';

export class Line extends GeometryBase implements ILine {
  kind: "line" = "line";

  constructor(point: Vector, direction: Vector) {
    super();

    this.position = point;
    this.direction = direction;
  }

  protected _normal!: Vector;
  get normal() { return this._normal; }
  set normal(value) {
    if (!value.isDirection)
      value = value.asDirection();

    this._normal = value;
  }

  protected _position!: Vector;
  get position() { return this._position; }
  set position(value) {
    if (!value.isPosition)
      value = value.asPosition();

    this._position = value;
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
    const mag = view.viewBounds.max.subO(view.viewBounds.min).magSquared;
    const dir = this.direction.scaleO(mag);
    const start = this.position.displaceByO(dir);
    const end = this.position.displaceByO(dir.negate());

    view.ctx.beginPath().line(start, end).stroke();
  }
}
