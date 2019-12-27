import { BroadPhase, NarrowPhase } from './collision';
import { Shape } from './shapes';

export interface IWorld {
  readonly broadPhase?: BroadPhase;
  readonly narrowPhase?: NarrowPhase;

  add(shape: Shape): void;
  remove(shape: Shape): void;
}
