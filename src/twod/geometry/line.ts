import { Geometry, GeometryBase, ILine } from '.';
import { Viewport } from '..';
import { Utils } from '../../utils';
import { Vector } from '../../vectors';

const { assertNever } = Utils;

export class Line extends GeometryBase implements ILine {
  kind: "line" = "line";

  constructor(point: Vector, direction: Vector) {
    super();

    this.point = point;
    this.direction = direction;
  }

  protected _point!: Vector;
  get point() { return this._point; }
  set point(value) {
    if (!value.isPosition)
      value = value.asPosition();

    this._point = value;
  }

  protected _direction!: Vector;
  get direction() { return this._direction; }
  set direction(value) {
    if (!value.isDirection)
      value = value.asDirection();

    this._direction = value.normalize();
  }

  getLineIntersection(other: ILine) {
    const denom = other.direction.cross2D(this.direction);

    if (denom === 0) return null;

    const c = other.point.subN(this.point);
    return other.direction.cross2D(c) / denom;
  }

  getLineIntersectionPoint(other: ILine, result?: Vector) {
    result = result || Vector.createPosition(0, 0);
    const t = this.getLineIntersection(other);

    if (t === null || t === null) return t;

    return this.point.addO(this.direction.scaleN(t), result);
  }

  getIntersectionPoint(other: Geometry, result?: Vector) {
    switch (other.kind) {
      case "line": return this.getLineIntersectionPoint(other, result);
      case "ray": return undefined;
      case "segment": return undefined;
      default: return assertNever(other);
    }
  }

  protected renderCore(viewport: Viewport) {
    const mag = viewport.viewBounds.max.subN(viewport.viewBounds.min).magSquared;
    const dir = this.direction.scaleN(mag);
    const point1 = this.point.displaceByN(dir);
    const point2 = this.point.displaceByN(dir.negate());

    viewport.ctx.beginPath().line(point1, point2).stroke();
  }
}
