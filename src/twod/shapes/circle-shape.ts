import { ICircleShape, ORIGIN, Projection, Shape, ShapeAxis, ShapeBase, SupportPoint } from '.';
import { ContextProps, EulerSemiImplicit, Integrator, IntegratorConstructor, Viewport } from '..';
import { Tristate } from '../../core';
import { Vector } from '../../vectors';

export class CircleShape extends ShapeBase implements ICircleShape {
  kind: "circle" = "circle";

  constructor(
    radius: number,
    isWorld?: boolean,
    integratorType: IntegratorConstructor = EulerSemiImplicit) {
    super();

    if (isWorld)
      this._isWorld = true;

    this.radius = radius;

    this._integratorType = integratorType;
    this._integrator = new integratorType();
    this._integrators = [this._integrator];
  }

  protected _integratorType: IntegratorConstructor;
  protected _integrator: Integrator;
  protected _integrators: Integrator[];
  get integrators() { return this._integrators; }
  get position() { return this._integrator.position; }
  set position(value) {
    this._integrator.position = value;
    this.dirtyTransform();
  }
  radius: number;
  get hasDynamicAxes() { return true; }

  getSupport(direction: Vector, result?: SupportPoint): Tristate<SupportPoint>;
  getSupport(axis: ShapeAxis, result?: SupportPoint): Tristate<SupportPoint>;
  getSupport(param1: Vector | ShapeAxis, result?: SupportPoint): Tristate<SupportPoint> {
    result || (result = new SupportPoint(this));

    let axisDirection: Vector;
    let axisPoint: Vector;

    if (param1 instanceof Vector) {
      axisDirection = param1;
      axisPoint = Vector.empty;
    } else {
      axisDirection = param1.normal;
      axisPoint = param1.point;
    }

    const point = axisDirection.scaleO(this.radius).asPosition();

    result.clear();
    result.shape = this;
    result.point = point;
    result.index = -1;
    result.distance = !axisPoint.isEmpty ? point.subO(axisPoint).dot(axisDirection) : point.dot(axisDirection);
    return result;
  }

  getDynamicAxes(other: Shape, result?: ShapeAxis[]) {
    result || (result = []);
    const posInOtherSpace = other.toLocal(this.position);
    const closestInOtherSpace = other.closestPoint(posInOtherSpace);
    let normal: Vector;
    // console.log(`position: ${this.position} => ${posInOtherSpace}, closest: ${closestInOtherSpace}`);

    if (closestInOtherSpace === null || closestInOtherSpace === undefined) return result;

    // TODO: Need to account for world shapes?
    if (closestInOtherSpace.equals(ORIGIN)) {
      // If centers are at the same position, return an arbitrary normal.
      normal = Vector.direction(0, 1);
    } else {
      const closest = other.toLocalOf(this, closestInOtherSpace);
      normal = closest.asDirection().normalize();
    }

    const point = normal.scaleO(this.radius).asPosition();
    result.push(new ShapeAxis(this, normal, point));
    return result;
  }

  projectOn(worldAxis: Vector, result?: Projection): Tristate<Projection> {
    const maxPoint = this.position.displaceByScaledO(worldAxis, this.radius);
    const minPoint = this.position.displaceByNegScaledO(worldAxis, this.radius);
    const maxValue = maxPoint.dot(worldAxis);
    const minValue = minPoint.dot(worldAxis);

    result || (result = new Projection());

    result.min = minValue;
    result.max = maxValue;
    result.minPoint = minPoint;
    result.maxPoint = maxPoint;

    return result;
  }

  protected renderCore(view: Viewport, props: ContextProps) {
    const ctx = view.ctx;

    ctx
      .beginPath()
      .circle(0, 0, this.radius)
      .moveTo(0, 0)
      .lineTo(this.radius, 0);

    props.fillStyle && ctx.fill();
    props.strokeStyle && ctx.stroke();
  }
}
