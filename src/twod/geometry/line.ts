import { Geometry, GeometryBase, ILine, IRay } from '.';
import { Viewport } from '..';
import { Utils } from '../../utils';
import { Vector } from '../../vectors';
import { calcIntersectionTime } from '../utils';

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
    return calcIntersectionTime(this.point, this.direction, other.point, other.direction);
  }

  getRayIntersection(other: IRay) {
    const s = calcIntersectionTime(other.start, other.direction, this.point, this.direction);

    if (s === null || s === undefined) return s;
    if (s < 0) return null;

    return calcIntersectionTime(this.point, this.direction, other.start, other.direction);
  }

  getLineIntersectionPoint(other: ILine, result?: Vector) {
    result = result || Vector.createPosition(0, 0);
    const t = calcIntersectionTime(this.point, this.direction, other.point, other.direction);

    if (t === null || t === undefined) return t;

    return this.point.addO(this.direction.scaleN(t), result);
  }

  getRayIntersectionPoint(ray: IRay, result?: Vector) {
    result = result || Vector.createPosition(0, 0);
    const t = this.getRayIntersection(ray);

    if (t === null || t === undefined) return t;

    return this.point.addO(this.direction.scaleN(t), result);
  }

  getIntersectionPoint(other: Geometry, result?: Vector) {
    switch (other.kind) {
      case "line": return this.getLineIntersectionPoint(other, result);
      case "ray": return this.getRayIntersectionPoint(other, result);
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
