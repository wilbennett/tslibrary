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
    this._distance = this.normal.dot(point1);
  }

  protected _normal!: Vector;
  get normal() { return this._normal; }
  set normal(value) {
    if (!value.isDirection)
      value = value.asDirection();

    this._normal = value;
  }

  protected _distance: number;
  get distance() { return this._distance; }
  set distance(value) { this._distance = value; }

  get position() { return this.normal.scaleO(this.distance).asPosition(); }
  set position(value) { this._distance = value.dot(this.normal); }
  get direction() { return this.normal.perpO(); }

  // @ts-ignore - unused param.
  protected renderCore(view: Viewport, props: ContextProps) {
    const point = this.position;
    const mag = view.viewBounds.max.subO(view.viewBounds.min).magSquared;
    const dir = this.direction.scale(mag);
    const start = point.displaceByO(dir);
    const end = point.displaceByO(dir.negate());

    view.ctx.beginPath().line(start, end).stroke();
    this.normal.render(view, point, props);
  }
}
