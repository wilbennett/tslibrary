import { GeometryBase, IPlane } from '.';
import { ContextProps, Viewport } from '..';
import { Vector } from '../../vectors';

export class Plane extends GeometryBase implements IPlane {
  kind: "plane" = "plane";

  constructor(point1: Vector, point2: Vector);
  constructor(kind: "pointnormal", point: Vector, normal: Vector);
  constructor(param1: Vector | "pointnormal", param2: Vector, param3?: Vector) {
    super();

    if (param1 instanceof Vector) {
      const point1 = param1;
      const point2 = param2;

      const ab = point2.subO(point1);
      const axb = point1.cross2D(point2);
      this.normal = axb >= 0 ? ab.perpLeft().normalize() : ab.perpRight().normalize();
      this._distance = this.normal.dot(point1);
    } else {
      const point = param2;
      const normal = param3;

      this.normal = normal!;
      this._distance = this.normal.dot(point);
    }
  }

  readonly normal: Vector;

  protected _distance: number;
  get distance() { return this._distance; }
  set distance(value) { this._distance = value; }

  get position() { return this.normal.scaleO(this.distance).asPosition(); }
  set position(value) { this.setPosition(value); }
  get direction() { return this.normal.perpO(); }

  setPosition(position: Vector) {
    this._distance = position.dot(this.normal);
  }

  protected renderCore(view: Viewport, props: ContextProps) {
    const point = this.position;
    const mag = view.viewBounds.max.subO(view.viewBounds.min).magSquared;
    const dir = this.direction.scale(mag);
    const start = point.displaceByO(dir);
    const end = point.displaceByNegO(dir);

    view.ctx.beginPath().line(start, end).stroke();
    this.normal.render(view, point, props);
  }
}
