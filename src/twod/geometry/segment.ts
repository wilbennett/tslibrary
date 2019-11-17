import { GeometryBase, ISegment } from '.';
import { ContextProps, Viewport } from '..';
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
  get edgeVector() { return this._edgeVector || (this._edgeVector = this.end.subO(this.start)); }
  protected _direction?: Vector;
  get direction() { return this._direction || (this._direction = this.edgeVector.normalizeO()); }

  get position() { return this._start.addO(this._end).normalizeW(); }
  set position(value) { this.setPosition(value); }

  reset() {
    this._edgeVector = undefined;
    this._direction = undefined;
  }

  setStart(value: Vector) {
    this._start.copyFrom(value);

    if (!this._start.isPosition)
      this._start.asPosition();

    this.reset();
  }

  setEnd(value: Vector) {
    this._end.copyFrom(value);

    if (!this._end.isPosition)
      this._end.asPosition();

    this.reset();
  }

  setPosition(position: Vector) {
    const offset = this.position.subO(position);
    this.start.displaceByNeg(offset);
    this.end.displaceByNeg(offset);
    this.reset();
  }

  // @ts-ignore - unused param.
  protected renderCore(view: Viewport, props: ContextProps) {
    view.ctx.beginPath().line(this.start, this.end).stroke();
  }
}
