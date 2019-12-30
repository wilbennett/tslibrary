import { IntegratorBase } from '.';
import { TimeStep } from '../../core';
import { Vector } from '../../vectors';

export class VerletPosition extends IntegratorBase {
  protected _oldPosition = Vector.position(0, 0);
  get oldPosition() { return this._oldPosition; }
  set oldPosition(value) { this._oldPosition = value; }
  get velocity() { return this._position.subO(this._oldPosition); }
  set velocity(value) { this._position.subO(value, this._oldPosition); }

  applyImpulse(impulse: Vector, contactVector: Vector) {
    this.velocity = this.velocity.add(impulse.scaleO(this.massInfo.massInverse));
    this._angularVelocity += this.massInfo.inertiaInverse * contactVector.cross2D(impulse);
  }

  protected integrateLinear(now: number, step: TimeStep) {
    const dtSqr = step.dtSquared;
    const pos = this.position;
    const oldPos = this.oldPosition;

    const temp = pos.clone();
    this.updateForces(now, pos, this.velocity);
    const acc = this._force.scaleO(this.massInfo.massInverse);
    pos.add(pos).sub(oldPos).addScaled(acc, dtSqr);
    oldPos.copyFrom(temp);
  }

  // @ts-ignore - unused param.
  protected integrateAngular(now: number, step: TimeStep) { }
}
