import { ContextProps, Viewport } from '..';
import { Vector } from '../../vectors';

export class Ray {
  constructor(start: Vector, direction: Vector) {
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

  lineDash: number[] = [];

  render(viewport: Viewport, props: ContextProps = { strokeStyle: "black" }) {
    const ctx = viewport.ctx;
    const mag = viewport.viewBounds.max.subN(viewport.viewBounds.min).mag;
    const dir = this.direction.scaleN(mag);
    const point2 = this.start.displaceByN(dir);

    let lineWidth = viewport.calcLineWidth(props.lineWidth !== undefined ? props.lineWidth : 1);

    const origLineDash = ctx.getLineDash();
    ctx.setLineDash(this.lineDash);
    ctx.withProps(props).withLineWidth(lineWidth);

    ctx
      .beginPath()
      .withProps(props)
      .line(this.start, point2)
      .stroke();

    ctx.setLineDash(origLineDash);
  }
}
