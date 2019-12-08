import { BroadPhase, Collider, ShapePairManager } from '.';
import { Shape } from '../shapes';

export class SimpleBroadPhase implements BroadPhase {
  constructor(collider: Collider) {
    this.collider = collider;
  }

  collider: Collider;

  // @ts-ignore - unused param.
  execute(shapes: Set<Shape>, pairManager: ShapePairManager) {
    const pairs = pairManager.pairs;
    const collider = this.collider;
    return pairs.filter(pair => collider.isColliding(pair));
  }
}
