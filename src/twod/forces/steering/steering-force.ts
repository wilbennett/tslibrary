import { SteeringAction } from '.';
import { ForceProcessParams, ForceSourceBase } from '..';
import { dir } from '../../../vectors';

const force = dir(0, 0);

export class SteeringForce extends ForceSourceBase {
  protected _actions: SteeringAction[] = [];
  protected _maxSpeed: number = 9;
  get maxSpeed() { return this._maxSpeed; }
  set maxSpeed(value) {
    this._maxSpeed = value;
    this._actions.forEach(action => action.maxSpeed = value);
  }
  protected _maxForce: number = 9;
  get maxForce() { return this._maxForce; }
  set maxForce(value) {
    this._maxForce = value;
    this._actions.forEach(action => action.maxForce = value);
  }

  add(...actions: SteeringAction[]) { this._actions.push(...actions); }

  remove(...actions: SteeringAction[]) {
    const self = this;
    actions.forEach(action => self._actions.remove(action));
  }

  clear() { this._actions.splice(0); }

  protected processCore(params: ForceProcessParams) {
    force.withXYW(0, 0, 0);

    for (const action of this._actions) {
      force.add(action.process(params).scale(action.weight));
    }

    params.shape.integrator.applyForce(force);
    return force;
  }
}
