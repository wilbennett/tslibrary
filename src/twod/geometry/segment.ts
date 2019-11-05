import { ContextProps, Viewport } from '..';
import { Vector } from '../../vectors';

export class Segment {
  constructor(start: Vector, end: Vector) {
    this.start = start;
    this.end = end;
  }

  protected _start!: Vector;
  get start() { return this._start; }
  set start(value) {
    if (!value.isPosition)
      value = value.asPosition();

    this._start = value;
    this.reset();
  }

  protected _end!: Vector;
  get end() { return this._end; }
  set end(value) {
    if (!value.isPosition)
      value = value.asPosition();

    this._end = value;
    this.reset();
  }

  protected _vector?: Vector;
  get vector() { return this._vector || (this._vector = this.end.subN(this.start)); }
  protected _direction?: Vector;
  get direction() { return this._direction || (this._direction = this.vector.normalizeN()); }

  lineDash: number[] = [];

  reset() {
    this._vector = undefined;
    this._direction = undefined;
  }

  setStart(value: Vector) {
    this._start.copyFrom(value);

    if (!this._start.isPosition)
      this._start = this._start.asPosition();

    this.reset();
  }

  setEnd(value: Vector) {
    this._end.copyFrom(value);

    if (!this._end.isPosition)
      this._end = this._end.asPosition();

    this.reset();
  }

  getSegmentIntersection(other: Segment) {
    const denom = other.direction.cross2D(this.direction);

    if (denom === 0) return undefined;

    const c = other.start.subN(this.start);
    return other.direction.cross2D(c) / denom;
  }

  getSegmentIntersectionPoint(other: Segment) {
    // TODO: Optimize.
    const t = this.getSegmentIntersection(other);

    if (t === undefined || t === null) return t;
    if (t < 0 || t * t > this.vector.dot(this.vector)) return undefined;

    const u = other.getSegmentIntersection(this);

    if (!u || u < 0 || u * u > other.vector.dot(other.vector)) return undefined;

    return this.start.addN(this.direction.scaleN(t));
  }

  render(viewport: Viewport, props: ContextProps = { strokeStyle: "black" }) {
    const ctx = viewport.ctx;
    let lineWidth = viewport.calcLineWidth(props.lineWidth !== undefined ? props.lineWidth : 1);

    const origLineDash = ctx.getLineDash();
    ctx.setLineDash(this.lineDash);
    ctx.withProps(props).withLineWidth(lineWidth);

    ctx
      .beginPath()
      .withProps(props)
      .line(this.start, this.end)
      .stroke();

    ctx.setLineDash(origLineDash);
  }
}
