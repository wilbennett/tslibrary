import { ICircleShape, ORIGIN, Shape, ShapeAxis, ShapeBase } from '.';
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

  getDynamicSupportAxes(other: Shape, result?: ShapeAxis[]) {
    result || (result = []);
    const posInOtherSpace = other.toLocal(this.position);
    const closestInOtherSpace = other.closestPoint(posInOtherSpace);
    let normal: Vector;
    // console.log(`position: ${this.position} => ${posInOtherSpace}, closest: ${closestInOtherSpace}`);

    if (closestInOtherSpace.equals(ORIGIN)) {
      // If centers are at the same position, return an arbitrary normal.
      normal = Vector.createDirection(0, 1);
    } else {
      const closest = other.toLocalOf(this, closestInOtherSpace);
      normal = closest.asDirection().normalize();
    }

    const point = normal.scale(this.radius).asPosition();
    result.push(new ShapeAxis(this, normal, point));
    return result;
  }

  getDynamicAxes(other: Shape, result?: Vector[]): Vector[] {
    result || (result = []);
    const posInOtherSpace = other.toLocal(this.position);
    const closest = other.toWorld(other.closestPoint(posInOtherSpace));
    // console.log(`position: ${this.position} => ${posInOtherSpace}, closest: ${closest}`);

    // If centers are at the same position, return an arbitrary axis.
    if (closest.equals(other.position)) {
      result.push(Vector.createDirection(0, 1));
      return result;
    }

    // Center is inside other shape.
    if (closest.equals(this.position)) {
      const axis = other.position.subO(this.position).normalize();
      result.push(axis);
      return result;
    }

    const axis = closest.subO(this.position).normalize();
    result.push(axis);
    return result;
  }

  protected getSupportFromVector(direction: Vector, result?: Vector): Tristate<number | Vector> {
    result || (result = Vector.create(0, 0));
    return direction.withMagO(this.radius, result).asPosition();
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
