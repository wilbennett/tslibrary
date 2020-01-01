import { SteeringAction } from '.';
import { ForceProcessParams } from '..';
import { dir, Vector } from '../../../vectors';

const desiredSeek = dir(0, 0);

export abstract class TargetAction extends SteeringAction {
  protected _target?: Vector;
  get target() { return this._target || Vector.empty; }
  set target(value) { this._target = value; }
  protected _maxSpeed: number = 9;
  get maxSpeed() { return this._maxSpeed; }
  set maxSpeed(value) { this._maxSpeed = value; }
  protected _maxForce: number = 9;
  get maxForce() { return this._maxForce; }
  set maxForce(value) { this._maxForce = value; }

  protected processCore(params: ForceProcessParams) {
    if (!this._shape) return Vector.empty;
    if (!this._target) return Vector.empty;
    if (params.shape !== this._shape) return Vector.empty;

    const maxForce = this._maxForce;
    const desiredVelocity = this.calcDesiredVelocity(params);
    desiredVelocity.normalizeScale(this._maxSpeed);
    const force = desiredVelocity.sub(params.velocity);
    force.magSquared > maxForce * maxForce && force.normalizeScale(maxForce);
    return force;
  }

  protected abstract calcDesiredVelocity(params: ForceProcessParams): Vector;

  protected calcDesiredSeekVelocity(position: Vector, target: Vector) {
    return target.subO(position, desiredSeek);
  }
}
