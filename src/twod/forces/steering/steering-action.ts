import { ForceProcessParams, ForceSourceBase } from '..';
import { dir, Vector } from '../../../vectors';

export abstract class SteeringAction extends ForceSourceBase {
  weight = 1;
  protected _maxSpeed: number = 9;
  get maxSpeed() { return this._maxSpeed; }
  set maxSpeed(value) { this._maxSpeed = value; }
  protected _maxForce: number = 9;
  get maxForce() { return this._maxForce; }
  set maxForce(value) { this._maxForce = value; }
  protected _desiredSeek = dir(0, 0);

  protected processCore(params: ForceProcessParams) {
    const desiredVelocity = this.calcDesiredVelocity(params);

    if (desiredVelocity.isEmpty) return Vector.empty;

    desiredVelocity.scale(Vector.pixelsPerMeter * params.step.dt);
    const force = desiredVelocity.sub(params.velocity);
    const maxForce = this._maxForce;
    force.magSquared > maxForce * maxForce && force.normalizeScale(maxForce);
    return force;
  }

  protected abstract calcDesiredVelocity(params: ForceProcessParams): Vector;

  protected seek(target: Vector, position: Vector, proportional: boolean = false, maxDistance?: number) {
    const desiredSeek = this._desiredSeek;
    target.subO(position, desiredSeek);

    if (proportional) {
      if (maxDistance) {
        let distance = maxDistance - desiredSeek.mag;
        distance || (distance = 1);
        desiredSeek.normalizeScale(this.maxSpeed / distance);
      }
    } else
      desiredSeek.normalizeScale(this._maxSpeed);

    return desiredSeek;
  }
}
