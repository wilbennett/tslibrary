import { Geometry, GeometryBase, ISegment } from '.';
import { Viewport } from '..';
import { Utils } from '../../utils';
import { Vector } from '../../vectors';

const { assertNever } = Utils;

export class Segment extends GeometryBase implements ISegment {
  kind: "segment" = "segment";

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

  protected getSegmentSegmentIntersection(first: ISegment, other: ISegment) {
    const denom = other.direction.cross2D(first.direction);

    if (denom === 0) return null;

    const c = other.start.subN(first.start);
    return other.direction.cross2D(c) / denom;
  }

  getSegmentIntersection(other: ISegment) { return this.getSegmentSegmentIntersection(this, other); }

  getSegmentIntersectionPoint(other: ISegment, result?: Vector) {
    // TODO: Optimize.
    result = result || Vector.createPosition(0, 0);
    const t = this.getSegmentSegmentIntersection(this, other);

    if (t === null || t === null) return t;
    if (t < 0 || t * t > this.edgeVector.dot(this.edgeVector)) return null;

    const u = this.getSegmentSegmentIntersection(other, this);

    if (!u || u < 0 || u * u > other.edgeVector.dot(other.edgeVector)) return null;

    return this.start.addO(this.direction.scaleN(t), result);
  }

  getIntersectionPoint(other: Geometry, result?: Vector) {
    switch (other.kind) {
      case "segment": return this.getSegmentIntersectionPoint(other, result);
      case "line": return undefined;
      case "ray": return undefined;
      default: return assertNever(other);
    }
  }

  protected renderCore(viewport: Viewport) {
    viewport.ctx.beginPath().line(this.start, this.end).stroke();
  }
}
