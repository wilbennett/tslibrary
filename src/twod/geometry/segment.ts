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

  readonly start: Vector; // Should not modify externally.
  readonly end: Vector; // Should not modify externally.

  protected _edgeVector?: Vector;
  get edgeVector() { return this._edgeVector || (this._edgeVector = this.end.subO(this.start)); }
  protected _direction?: Vector;
  get direction() { return this._direction || (this._direction = this.edgeVector.normalizeO()); }

  get position() { return this.start.addO(this.end).normalizeW(); }
  set position(value) { this.setPosition(value); }

  setPosition(position: Vector) {
    const offset = this.position.subO(position);
    this.start.displaceByNeg(offset);
    this.end.displaceByNeg(offset);
  }

  // @ts-ignore - unused param.
  protected renderCore(view: Viewport, props: ContextProps) {
    view.ctx.beginPath().line(this.start, this.end).stroke();
  }
}
