import { GeometryBase, IPlane } from '.';
import { ContextProps, Viewport } from '..';
import { Vector } from '../../vectors';

export class Plane extends GeometryBase implements IPlane {
  kind: "plane" = "plane";

  constructor(point1: Vector, point2: Vector) {
    super();

    const ab = point2.subO(point1);
    const axb = point1.cross2D(point2);
    this.normal = axb >= 0 ? ab.perpLeft().normalize() : ab.perpRight().normalize();
    this.distance = this.normal.dot(point1);
  }

  protected _normal!: Vector;
  get normal() { return this._normal; }
  set normal(value) {
    if (!value.isDirection)
      value = value.asDirection();

    this._normal = value;
  }

  distance: number;

  get point() { return this.normal.scaleO(this.distance); }

  // @ts-ignore - unused param.
  protected renderCore(view: Viewport, props: ContextProps) {
    const point = this.point;
    const mag = view.viewBounds.max.subO(view.viewBounds.min).magSquared;
    const dir = this.normal.perpRightO().scale(mag);
    const start = point.displaceByO(dir);
    const end = point.displaceByO(dir.negate());

    view.ctx.beginPath().line(start, end).stroke();
    this.normal.render(view, point, props);
  }
}
