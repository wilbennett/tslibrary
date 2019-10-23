import { IntegratorBase } from '.';
import { TimeStep } from '../../core';
import { Vector } from '../../vectors';

export class VerletPositionTime extends IntegratorBase {
  protected _oldPosition = Vector.createPosition(0, 0);
  get oldPosition() { return this._oldPosition; }
  set oldPosition(value) {
    this._oldPosition = value;
    this.dirty();
  }

  protected _velocity = Vector.createDirection(0, 0);
  get velocity() { return this._velocity; }
  set velocity(value) {
    this._velocity = value;
    this.dirty();
  }

  applyImpulse(impulse: Vector, contactVector: Vector) {
    this._velocity.add(impulse.scaleN(this.massInfo.massInverse));
    this._angularVelocity += this.massInfo.inertiaInverse * contactVector.cross2D(impulse);
  }

  integrate(now: number, step: TimeStep) {
    const dt = step.dt;
    const olddt = step.dt;
    const dtSqr = step.dtSquared;
    const halfDivDt = step.halfDivDt;
    const pos = this.position;
    const oldPos = this.oldPosition;

    const temp = pos.clone(); // store current position in temp variable.
    this.updateForces(now, pos, this.velocity);
    const acc = this._force.scale(this.massInfo.massInverse); // acceleration based on current pos and velocity.
    pos.addScaled(pos.subN(oldPos), dt / olddt).addScaled(acc, dtSqr); // update position.
    this._velocity.copyFrom(pos.subN(oldPos).scale(halfDivDt));	// estimate new velocity.
    oldPos.copyFrom(temp); // store pos before update; will be pos at previous timestep next time.

    // TODO: Update.
    this._angle += this._angularVelocity * dt;
    this._angularAcceleration += this._torque * this.massInfo.inertiaInverse;
    this._angularVelocity += this._angularAcceleration * dt;
    this.dirty();
  }
}
