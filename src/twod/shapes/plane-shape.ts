import { IPlaneShape, ShapeBase } from '.';
import { ContextProps, Viewport } from '..';
import { Tristate } from '../../core';
import { Vector } from '../../vectors';

export class PlaneShape extends ShapeBase implements IPlaneShape {
  kind: "plane" = "plane";

  constructor(
    point1: Vector,
    point2: Vector,
    isWorld?: boolean) {
    super();

    if (isWorld)
      this._isWorld = true;

    const ab = point2.subO(point1);
    const axb = point1.cross2D(point2);
    this.normal = axb >= 0 ? ab.perpLeft().normalize() : ab.perpRight().normalize();
    this.distance = this.normal.dot(point1);
    this._position = this.normal.scaleO(this.distance).asPosition();
  }

  protected _position: Vector;
  get position() { return this._position; }
  set position(value) {
    this._position = value;
    this.setPosition(value);
  }

  readonly normal: Vector;

  distance: number;
  get direction() { return this.normal.perpO(); }

  setPosition(position: Vector) {
    this.distance = position.dot(this.normal);
    this._position = this.normal.scaleO(this.distance).asPosition();
    this.dirtyTransform();
  }

  getAxes(result?: Vector[]): Vector[] {
    result || (result = []);
    result.push(this.normal);
    return result;
  }

  // projectOn(worldAxis: Vector, result?: Projection): Tristate<Projection> {
  //   const value = this.position.dot(worldAxis);

  //   result || (result = new Projection());

  //   result.min = value;
  //   result.max = value;
  //   result.minPoint = this.position;
  //   result.maxPoint = this.position;

  //   return result;
  // }

  // @ts-ignore - unused param.
  protected getSupportFromVector(direction: Vector, result?: Vector): Tristate<number | Vector> {
    return result;
  }

  protected renderCore(view: Viewport, props: ContextProps) {
    const mag = view.viewBounds.max.subO(view.viewBounds.min).magSquared;
    const dir = this.direction.scale(mag);
    const start = dir.asPosition();
    const end = dir.negateO();

    view.ctx.beginPath().line(start, end).stroke();
    this.normal.render(view, Vector.createPosition(0, 0), props);
  }
}
