import { GeometryBase, IRay } from '.';
import { Viewport } from '..';
import { Vector } from '../../vectors';

export class Ray extends GeometryBase implements IRay {
  kind!: "ray";

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

  getRayIntersection(other: Ray) {
    const denom = other.direction.cross2D(this.direction);

    if (denom === 0) return null;

    const c = other.start.subN(this.start);
    return other.direction.cross2D(c) / denom;
  }

  getRayIntersectionPoint(other: Ray, result?: Vector) {
    // TODO: Optimize.
    result = result || Vector.createPosition(0, 0);
    const t = this.getRayIntersection(other);

    if (t === null || t === null) return t;
    if (t < 0) return null;

    const otherT = other.getRayIntersection(this);

    if (!otherT || otherT < 0) return null;

    return this.start.addO(this.direction.scaleN(t), result);
  }

  protected renderCore(viewport: Viewport) {
    const mag = viewport.viewBounds.max.subN(viewport.viewBounds.min).mag;
    const dir = this.direction.scaleN(mag);
    const point2 = this.start.displaceByN(dir);

    viewport.ctx.beginPath().line(this.start, point2).stroke();
  }
}
