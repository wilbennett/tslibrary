import { Bounds } from '../misc';
import { BroadPhase, NarrowPhase } from './collision';
import { ForceSource } from './forces';
import { Shape } from './shapes';

export interface IWorld {
  readonly bounds: Bounds;
  readonly broadPhase?: BroadPhase;
  readonly narrowPhase?: NarrowPhase;

  add(shape: Shape): void;
  remove(shape: Shape): void;
  addForce(force: ForceSource, duration?: number): void;
  removeForce(force: ForceSource): void;
}
