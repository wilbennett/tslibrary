import { GeometryBase, IRay } from '.';
import { ContextProps, Viewport } from '..';
import { Vector } from '../../vectors';

export class Ray extends GeometryBase implements IRay {
  kind: "ray" = "ray";

  constructor(start: Vector, direction: Vector) {
    super();

    this.start = start;
    this.direction = direction;
  }

  protected _start!: Vector;
  get start() { return this._start; }
  set start(value) {
    if (!value.isPosition)
      value = value.asPosition();

    this._start = value;
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
    const mag = view.viewBounds.max.subO(view.viewBounds.min).mag;
    const dir = this.direction.scaleO(mag);
    const end = this.start.displaceByO(dir);

    view.ctx.beginPath().line(this.start, end).stroke();
  }
}
