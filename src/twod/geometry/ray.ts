import { GeometryBase, IRay } from '.';
import { Viewport } from '..';
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

  protected renderCore(viewport: Viewport) {
    const mag = viewport.viewBounds.max.subN(viewport.viewBounds.min).mag;
    const dir = this.direction.scaleN(mag);
    const point2 = this.start.displaceByN(dir);

    viewport.ctx.beginPath().line(this.start, point2).stroke();
  }
}
