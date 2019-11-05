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
  }

  protected _end!: Vector;
  get end() { return this._end; }
  set end(value) {
    if (!value.isPosition)
      value = value.asPosition();

    this._end = value;
  }

  lineDash: number[] = [];

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
