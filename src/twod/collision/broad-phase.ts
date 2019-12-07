import { Collider, ShapePair, ShapePairManager } from '.';
import { Shape } from '../shapes';


export interface BroadPhase {
  collider: Collider;

  execute(shapes: Shape[], pairManager: ShapePairManager): ShapePair[];
}
