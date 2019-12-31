import { ForceSourceBase } from '.';
import { MathEx, TimeStep } from '../../core';
import { Vector } from '../../vectors';
import { Shape } from '../shapes';

export class HeadingForce extends ForceSourceBase {
  constructor() {
    super();

    this.angleLookAheadSteps = 3;
  }

  protected _invAngleLookAheadSteps!: number;
  protected _angleLookAheadSteps!: number;
  get angleLookAheadSteps() { return this._angleLookAheadSteps; }
  set angleLookAheadSteps(value) {
    this._angleLookAheadSteps = value;
    this._invAngleLookAheadSteps = 1 / value;
  }

  turnSpeed = 0.01;

  protected processCore(
    shape: Shape,
    // @ts-ignore - unused param.
    now: number,
    step: TimeStep,
    // @ts-ignore - unused param.
    position: Vector,
    velocity: Vector,
    angle: number,
    angularVelocity: number) {
    let shapeAngle = angle;
    const velocityAngle = velocity.radians;

    shapeAngle += angularVelocity * Vector.pixelsPerMeter * this._invAngleLookAheadSteps;
    const diff = velocityAngle - shapeAngle;
    let abs = Math.abs(diff);
    let targetAngle = abs <= Math.PI ? abs : MathEx.TWO_PI - abs;
    (diff < 0 || abs > Math.PI) && (targetAngle = -targetAngle);

    let torque = targetAngle;
    torque *= this.turnSpeed;
    torque *= step.dtInverse;
    torque *= Vector.pixelsPerMeterInverse;
    torque = torque * shape.massInfo.inertiaInverse * step.dtInverse;

    shape.integrator.applyTorque(torque);
  }
}
