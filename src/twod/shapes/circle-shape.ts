import { ICircleShape, ShapeBase } from '.';
import { ContextProps, EulerSemiImplicit, Integrator, IntegratorConstructor, Viewport } from '..';
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
  set position(value) { this._integrator.position = value; }
  radius: number;

  protected renderCore(view: Viewport, props: ContextProps) {
    const ctx = view.ctx;
    // const orientPos = Vector.createDirection(this.radius, 0);
    const orientPos = Vector.createDirection(this.position.x + this.radius, this.position.y);

    ctx
      .beginPath()
      .circle(this.position, this.radius)
      .moveTo(this.position)
      .lineTo(orientPos);

    props.fillStyle && ctx.fill();
    props.strokeStyle && ctx.stroke();
  }
}
