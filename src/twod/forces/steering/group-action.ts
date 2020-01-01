import { SteeringAction } from '.';
import { ForceProcessParams } from '..';
import { Vector } from '../../../vectors';
import { Shape } from '../../shapes';

export abstract class GroupAction extends SteeringAction {
  protected _group?: Set<Shape>;
  get group() { return this._group; }
  set group(value) { this._group = value; }

  protected processCore(params: ForceProcessParams) {
    if (!this._group) return Vector.empty;
    if (!this._group.has(params.shape)) return Vector.empty;

    return super.processCore(params);
  }
}
