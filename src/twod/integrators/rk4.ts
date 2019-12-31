import { IntegratorBase } from '.';
import { TimeStep } from '../../core';
import { Vector } from '../../vectors';

export class RK4 extends IntegratorBase {
  private _velocity = Vector.direction(0, 0);
  get velocity() { return this._velocity; }
  set velocity(value) { this._velocity.withXY(value.x, value.y); }

  applyImpulse(impulse: Vector, contactVector: Vector) {
    this._velocity.add(impulse.scaleO(this.massInfo.massInverse));
    this._angularVelocity += this.massInfo.inertiaInverse * contactVector.cross2D(impulse);
  }

  protected integrateLinear(now: number, step: TimeStep) {
    const dt = step.dt;
    const dtDiv2 = step.dtDiv2;
    const dtDiv3 = step.dtDiv3;
    const dtDiv6 = step.dtDiv6;

    const pos1 = this.position;
    const vel1 = this.velocity;
    this.updateForces(now, step, pos1, vel1, this.angle, this.angularVelocity);
    const acc1 = this._force.scaleO(this.massInfo.massInverse);

    const pos2 = pos1.addScaledO(vel1.toPixelsO(), dtDiv2);
    const vel2 = vel1.addScaledO(acc1, dtDiv2);
    this.clearForces(false);
    this.updateForces(now + dtDiv3, step, pos2, vel2, this.angle, this.angularVelocity);
    const acc2 = this._force.scaleO(this.massInfo.massInverse);

    const pos3 = pos1.addScaledO(vel2.toPixelsO(), dtDiv2);
    const vel3 = vel1.addScaledO(acc2, dtDiv2);
    this.clearForces(false);
    this.updateForces(now + dtDiv3 + dtDiv3, step, pos3, vel3, this.angle, this.angularVelocity);
    const acc3 = this._force.scaleO(this.massInfo.massInverse);

    const pos4 = pos1.addScaledO(vel3.toPixelsO(), dt);
    const vel4 = vel1.addScaledO(acc3, dt);
    this.clearForces(false);
    this.updateForces(now + dt, step, pos4, vel4, this.angle, this.angularVelocity);
    const acc4 = this._force.scaleO(this.massInfo.massInverse);

    const velSum = vel2.add(vel3).add(vel4).add(vel1);
    this._acceleration = acc1.add(acc2).add(acc3).add(acc4);

    this.position.addScaled(velSum.toPixels(), dtDiv6);
    this._velocity.addScaled(this._acceleration, dtDiv6);
  }
}
