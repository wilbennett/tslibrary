import { GeometryBase, ISegment } from '.';
import { Viewport } from '..';
import { Vector } from '../../vectors';

export class Segment extends GeometryBase implements ISegment {
  kind!: "segment";

  constructor(start: Vector, end: Vector) {
    super();

    this.start = start;
    this.end = end;
  }

  protected _start!: Vector;
  get start() { return this._start; }
  set start(value) {
    this._start = value;
    this.setStart(value);
  }

  protected _end!: Vector;
  get end() { return this._end; }
  set end(value) {
    this._end = value;
    this.setEnd(value);
  }

  protected _edgeVector?: Vector;
  get edgeVector() { return this._edgeVector || (this._edgeVector = this.end.subN(this.start)); }
  protected _direction?: Vector;
  get direction() { return this._direction || (this._direction = this.edgeVector.normalizeN()); }

  reset() {
    this._edgeVector = undefined;
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

    if (denom === 0) return null;

    const c = other.start.subN(this.start);
    return other.direction.cross2D(c) / denom;
  }

  getSegmentIntersectionPoint(other: Segment, result?: Vector) {
    // TODO: Optimize.
    result = result || Vector.createPosition(0, 0);
    const t = this.getSegmentIntersection(other);

    if (t === null || t === null) return t;
    if (t < 0 || t * t > this.edgeVector.dot(this.edgeVector)) return null;

    const u = other.getSegmentIntersection(this);

    if (!u || u < 0 || u * u > other.edgeVector.dot(other.edgeVector)) return null;

    return this.start.addO(this.direction.scaleN(t), result);
  }

  protected renderCore(viewport: Viewport) {
    viewport.ctx.beginPath().line(this.start, this.end).stroke();
  }
}
