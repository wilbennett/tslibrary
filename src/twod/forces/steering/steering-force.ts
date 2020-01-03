import { SteeringAction } from '.';
import { ForceProcessParams, ForceSourceBase } from '..';
import { IWorld } from '../..';
import { dir, Vector } from '../../../vectors';

const force = dir(0, 0);

export class SteeringForce extends ForceSourceBase {
  protected _actions: SteeringAction[] = [];
  get actions() { return this._actions; }
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
  scale: number = 1;
  protected _forces: Vector[] = [];
  protected _weightedMags: number[] = [];

  add(action: SteeringAction, duration?: number, setStartTime: boolean = true) {
    if (this._world) {
      setStartTime && (action.startTime = this._world.worldTime);
      duration !== undefined && (action.duration = duration);
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
