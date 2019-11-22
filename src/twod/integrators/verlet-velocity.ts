import { IntegratorBase } from '.';
import { TimeStep } from '../../core';
import { Vector } from '../../vectors';

export class VerletVelocity extends IntegratorBase {
  protected _velocity = Vector.direction(0, 0);
  get velocity() { return this._velocity; }
  set velocity(value) {
    this._velocity = value;
    this.dirty();
  }

  applyImpulse(impulse: Vector, contactVector: Vector) {
    this.velocity.add(impulse.scaleO(this.massInfo.massInverse));
    this._angularVelocity += this.massInfo.inertiaInverse * contactVector.cross2D(impulse);
  }

  integrate(now: number, step: TimeStep) {
    const dt = step.dt;
    const dtDiv2 = step.dtDiv2;
    const dtSqrDiv2 = step.dtSqrDiv2;
    const pos = this.position;
    const vel = this.velocity;

    this.updateForces(now, pos, vel);
    let acc = this._force.scaleO(this.massInfo.massInverse);
    const prevAcc = acc;
    pos.addScaled(vel, dt).addScaled(acc, dtSqrDiv2);
    this.updateForces(now, pos, vel);
    acc = this._force.scaleO(this.massInfo.massInverse); // NOTE: Assume force does not depend explicitly on velocity.
    vel.addScaled(acc.add(prevAcc), dtDiv2);

    // TODO: Update.
    this._angle += this._angularVelocity * dt;
    this._angularAcceleration += this._torque * this.massInfo.inertiaInverse;
    this._angularVelocity += this._angularAcceleration * dt;
    this.dirty();
  }
}
