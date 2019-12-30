import { IntegratorBase } from '.';
import { TimeStep } from '../../core';
import { Vector } from '../../vectors';

export class VerletPositionTime extends IntegratorBase {
  protected _oldPosition = Vector.position(0, 0);
  get oldPosition() { return this._oldPosition; }
  set oldPosition(value) {
    this._oldPosition = value;
  }

  protected _velocity = Vector.direction(0, 0);
  get velocity() { return this._velocity; }
  set velocity(value) { this._velocity = value; }

  applyImpulse(impulse: Vector, contactVector: Vector) {
    this._velocity.add(impulse.scaleO(this.massInfo.massInverse));
    this._angularVelocity += this.massInfo.inertiaInverse * contactVector.cross2D(impulse);
  }

  protected integrateLinear(now: number, step: TimeStep) {
    const dt = step.dt;
    const olddt = step.dt;
    const dtSqr = step.dtSquared;
    const halfDivDt = step.halfDivDt;
    const pos = this.position;
    const oldPos = this.oldPosition;

    const temp = pos.clone();
    this.updateForces(now, pos, this.velocity);
    const acc = this._force.scaleO(this.massInfo.massInverse);
    pos.addScaled(pos.subO(oldPos), dt / olddt).addScaled(acc, dtSqr);
    this._velocity.copyFrom(pos.subO(oldPos).scale(halfDivDt));
    oldPos.copyFrom(temp);
  }

  // @ts-ignore - unused param.
  protected integrateAngular(now: number, step: TimeStep) { }
}
