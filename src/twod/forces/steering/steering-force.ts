import { SteeringAction } from '.';
import { ForceProcessParams, ForceSourceBase } from '..';
import { IWorld } from '../..';
import { dir, Vector } from '../../../vectors';

const force = dir(0, 0);

export class SteeringForce extends ForceSourceBase {
  protected _actions: SteeringAction[] = [];
  get actions() { return this._actions; }
  protected _maxActionSpeed: number = 9;
  get maxActionSpeed() { return this._maxActionSpeed; }
  set maxActionSpeed(value) {
    this._maxActionSpeed = value;
    this._actions.forEach(action => action.maxSpeed = value);
  }
  protected _maxActionForce: number = 9;
  get maxActionForce() { return this._maxActionForce; }
  set maxActionForce(value) {
    this._maxActionForce = value;
    this._actions.forEach(action => action.maxForce = value);
  }
  scale: number = 1;
  protected _forces: Vector[] = [];
  protected _weightedMags: number[] = [];

  add(action: SteeringAction, adjustLimits: boolean = true, duration?: number, setStartTime: boolean = true) {
    if (this._world) {
      setStartTime && (action.startTime = this._world.worldTime);
      duration !== undefined && (action.duration = duration);
    }

    if (adjustLimits) {
      action.maxSpeed = this._maxActionSpeed;
      action.maxForce = this._maxActionForce;
    }

    this._actions.push(action);
  }

  remove(...actions: SteeringAction[]) {
    const self = this;
    actions.forEach(action => self._actions.remove(action));
  }

  clear() { this._actions.splice(0); }

  initialize(world: IWorld) {
    super.initialize(world);
    this._actions.forEach(action => action.initialize(world));
  }

  finalize(world: IWorld) {
    super.finalize(world);
    this._actions.forEach(action => action.finalize(world));
  }

  protected processCore(params: ForceProcessParams) {
    if (this._actions.length === 0) return Vector.empty;

    const now = params.now;
    const actions = this._actions;
    const forces = this._forces;
    const weightedMags = this._weightedMags;
    force.withXYW(0, 0, 0);
    let totalMag = 0;
    let totalWeightedMagsInv = 0;
    let index = 0;

    for (let i = actions.length - 1; i >= 0; i--) {
      const action = actions[i];

      if (action.isExpired(now)) {
        actions.remove(action);
        continue;
      }

      const currentForce = action.process(params);
      const mag = currentForce.mag;
      const weightedMag = mag * action.weight;
      currentForce.div(mag);
      forces[index] = currentForce;
      weightedMags[index] = weightedMag;
      totalMag += mag;
      totalWeightedMagsInv += weightedMag;
      index++;
    }

    const count = this._actions.length;

    if (count === 0) return Vector.empty;

    totalWeightedMagsInv = 1 / totalWeightedMagsInv;

    for (let i = 0; i < count; i++) {
      const currentForce = forces[i];
      const scale = weightedMags[i] * totalWeightedMagsInv;
      currentForce.scale(totalMag * scale);
      force.add(currentForce);
    }

    params.shape.integrator.applyForce(force);
    return force;
  }
}
