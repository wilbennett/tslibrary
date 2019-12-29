import { Bounds } from '../misc';
import { BroadPhase, NarrowPhase } from './collision';
import { Shape } from './shapes';

export interface IWorld {
  readonly bounds: Bounds;
  readonly broadPhase?: BroadPhase;
  readonly narrowPhase?: NarrowPhase;

  add(shape: Shape): void;
  remove(shape: Shape): void;
}
