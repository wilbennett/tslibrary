import { ForceProcessParams, ForceSourceBase } from '.';
import { MathEx } from '../../core';
import { Vector } from '../../vectors';

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
  maxTorque = Math.PI * 0.5;

  protected processCore(params: ForceProcessParams) {
    const { shape, step, angle, velocity, angularVelocity } = params;
    let shapeAngle = angle;
    const velocityAngle = velocity.radians;

    shapeAngle += angularVelocity * Vector.pixelsPerMeter * this._invAngleLookAheadSteps;
    const diff = velocityAngle - shapeAngle;
    let abs = Math.abs(diff);
    let targetAngle = abs <= Math.PI ? abs : MathEx.TWO_PI - abs;
    (diff < 0 || abs > Math.PI) && (targetAngle = -targetAngle);

    if (abs < Math.PI * 0.01) return Vector.empty;

    let torque = targetAngle;
    torque *= this.turnSpeed;
    torque *= step.dtInverse;
    torque *= Vector.pixelsPerMeterInverse;
    torque = torque * shape.massInfo.inertiaInverse * step.dtInverse;
    torque = MathEx.clamp(torque, -this.maxTorque, this.maxTorque);

    shape.integrator.applyTorque(torque);
    return Vector.empty;
  }
}
