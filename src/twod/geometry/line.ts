import { ContextProps, Viewport } from '..';
import { Vector } from '../../vectors';

export class Line {
  constructor(point: Vector, direction: Vector) {
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

  lineDash: number[] = [];

  getLineIntersection(other: Line) {
    const denom = other.direction.cross2D(this.direction);

    if (denom === 0) return null;

    const c = other.point.subN(this.point);
    return other.direction.cross2D(c) / denom;
  }

  getLineIntersectionPoint(other: Line) {
    const t = this.getLineIntersection(other);

    if (t === null || t === null) return t;

    return this.point.addN(this.direction.scaleN(t));
  }

  render(viewport: Viewport, props: ContextProps = { strokeStyle: "black" }) {
    const ctx = viewport.ctx;
    const mag = viewport.viewBounds.max.subN(viewport.viewBounds.min).magSquared;
    const dir = this.direction.scaleN(mag);
    const point1 = this.point.displaceByN(dir);
    const point2 = this.point.displaceByN(dir.negate());

    let lineWidth = viewport.calcLineWidth(props.lineWidth !== undefined ? props.lineWidth : 1);

    const origLineDash = ctx.getLineDash();
    ctx.setLineDash(this.lineDash);
    ctx.withProps(props).withLineWidth(lineWidth);

    ctx
      .beginPath()
      .withProps(props)
      .line(point1, point2)
      .stroke();

    ctx.setLineDash(origLineDash);
  }
}
