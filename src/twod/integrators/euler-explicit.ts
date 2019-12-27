import { IntegratorBase } from '.';
import { TimeStep } from '../../core';
import { Vector } from '../../vectors';

export class EulerExplicit extends IntegratorBase {
  private _velocity = Vector.direction(0, 0);
  get velocity() { return this._velocity; }
  set velocity(value) { this._velocity.withXY(value.x, value.y); }

  applyImpulse(impulse: Vector, contactVector: Vector) {
    this._velocity.add(impulse.scaleO(this.massInfo.massInverse));
    this._angularVelocity += this.massInfo.inertiaInverse * contactVector.cross2D(impulse);
  }

  integrate(now: number, step: TimeStep) {
    const dt = step.dt;
    this.updateForces(now, this.position, this.velocity);

    this._acceleration = this._force.scaleO(this.massInfo.massInverse);
    this.position.addScaled(this._velocity.toPixelsO(), dt);
    this._velocity.addScaled(this._acceleration, dt);

    this._angularAcceleration += this._torque * this.massInfo.inertiaInverse;
    this.angle += this._angularVelocity * dt;
    this._angularVelocity += this._angularAcceleration * dt;

    this.clearForces();
  }
}
