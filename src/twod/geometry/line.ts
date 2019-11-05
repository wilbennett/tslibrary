import { ContextProps, Viewport } from '..';
import { Vector } from '../../vectors';

export class Line {
  constructor(point: Vector, direction: Vector) {
    if (!point.isPosition)
      point = point.asPosition();

    if (!direction.isDirection)
      direction = direction.asDirection();

    this.point = point;
    this.direction = direction.normalize();
  }

  point: Vector;
  direction: Vector;
  lineDash: number[] = [];

  render(viewport: Viewport, props: ContextProps = { strokeStyle: "black" }) {
    const ctx = viewport.ctx;
    const mag = viewport.viewBounds.max.subN(viewport.viewBounds.min).mag;
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
