import { GeometryBase, ISegment } from '.';
import { Viewport } from '..';
import { Vector } from '../../vectors';

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

  protected renderCore(viewport: Viewport) {
    viewport.ctx.beginPath().line(this.start, this.end).stroke();
  }
}
