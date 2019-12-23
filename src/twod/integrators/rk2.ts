import { IntegratorBase } from '.';
import { TimeStep } from '../../core';
import { Vector } from '../../vectors';

export class RK2 extends IntegratorBase {
  private _velocity = Vector.direction(0, 0);
  get velocity() { return this._velocity; }
  set velocity(value) { this._velocity.withXY(value.x, value.y); }

  applyImpulse(impulse: Vector, contactVector: Vector) {
    this._velocity.add(impulse.scaleO(this.massInfo.massInverse));
    this._angularVelocity += this.massInfo.inertiaInverse * contactVector.cross2D(impulse);
  }

  integrate(now: number, step: TimeStep) {
    const dt = step.dt;
    const dtDiv2 = step.dtDiv2;

    const pos1 = this.position;
    const vel1 = this.velocity;
    this.updateForces(now, pos1, vel1);
    const acc1 = this._force.scaleO(this.massInfo.massInverse);

    const pos2 = pos1.addScaledO(vel1.toPixelsO(), dt);
    const vel2 = vel1.addScaledO(acc1, dt);
    this.updateForces(now + dt, pos2, vel2);
    const acc2 = this._force.scaleO(this.massInfo.massInverse);

    this._position.addScaled(vel2.add(vel1).toPixels(), dtDiv2);
    this._acceleration = acc1.add(acc2);
    this._velocity.addScaled(this._acceleration, dtDiv2);

    // TODO: Update.
    this._angle += this._angularVelocity * dt;
    this._angularAcceleration += this._torque * this.massInfo.inertiaInverse;
    this._angularVelocity += this._angularAcceleration * dt;
  }
}
