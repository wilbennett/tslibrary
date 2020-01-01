import { SteeringAction } from '.';
import { ForceProcessParams } from '..';
import { Vector } from '../../../vectors';

export abstract class TargetAction extends SteeringAction {
  protected _target?: Vector;
  get target() { return this._target || Vector.empty; }
  set target(value) { this._target = value; }

  protected processCore(params: ForceProcessParams) {
    if (!this._shape) return Vector.empty;
    if (!this._target) return Vector.empty;
    if (params.shape !== this._shape) return Vector.empty;

    return super.processCore(params);
  }
}
