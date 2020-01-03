import { ForceProcessParams, ForceSourceBase } from '..';
import { dir, Vector } from '../../../vectors';

const desiredSeek = dir(0, 0);

export abstract class SteeringAction extends ForceSourceBase {
  weight = 1;
  protected _maxSpeed: number = 9;
  get maxSpeed() { return this._maxSpeed; }
  set maxSpeed(value) { this._maxSpeed = value; }
  protected _maxForce: number = 9;
  get maxForce() { return this._maxForce; }
  set maxForce(value) { this._maxForce = value; }

  protected processCore(params: ForceProcessParams) {
    const desiredVelocity = this.calcDesiredVelocity(params);

    if (desiredVelocity.isEmpty) return Vector.empty;

    const maxSpeed = this._maxSpeed;
    desiredVelocity.magSquared > maxSpeed * maxSpeed && desiredVelocity.normalizeScale(maxSpeed);
    desiredVelocity.scale(Vector.pixelsPerMeter * params.step.dt);
    const force = desiredVelocity.sub(params.velocity);
    const maxForce = this._maxForce;
    force.magSquared > maxForce * maxForce && force.normalizeScale(maxForce);
    return force;
  }

  protected abstract calcDesiredVelocity(params: ForceProcessParams): Vector;

  // @ts-ignore - unused param.
  protected seek(target: Vector, position: Vector, proportional: boolean = false) {
    return target.subO(position, desiredSeek);
  }
}
