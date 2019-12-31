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

  protected integrateLinear(now: number, step: TimeStep) {
    const dt = step.dt;
    this.updateForces(now, step, this.position, this.velocity, this.angle, this.angularVelocity);

    this._acceleration = this._force.scaleO(this.massInfo.massInverse);
    this.position.addScaled(this._velocity.toPixelsO(), dt);
    this._velocity.addScaled(this._acceleration, dt);
  }
}
