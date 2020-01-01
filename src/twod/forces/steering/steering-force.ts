import { SteeringAction } from '.';
import { ForceProcessParams, ForceSourceBase } from '..';
import { dir } from '../../../vectors';

const force = dir(0, 0);

export class SteeringForce extends ForceSourceBase {
  protected _actions: SteeringAction[] = [];

  add(...actions: SteeringAction[]) { this._actions.push(...actions); }

  remove(...actions: SteeringAction[]) {
    const self = this;
    actions.forEach(action => self._actions.remove(action));
  }


  protected processCore(params: ForceProcessParams) {
    force.withXYW(0, 0, 0);

    for (const action of this._actions) {
      force.add(action.process(params).scale(action.weight));
    }

    params.shape.integrator.applyForce(force);
    return force;
  }
}
