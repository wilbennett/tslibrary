import { Collider, ColliderBase, Contact, ShapePair } from '.';
import { Tristate } from '../../core';

export class SATProjection extends ColliderBase {
  constructor(fallback?: Collider) {
    super(fallback);
  }

  protected isCollidingCore(shapes: ShapePair): boolean | undefined {
    // const { first, second } = shapes;

    return undefined;
  }

  protected calcContactCore(shapes: ShapePair): Tristate<Contact> {
    // const { first, second } = shapes;

    return undefined;
  }
}
