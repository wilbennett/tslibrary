import { Collider, Contact, ShapePair } from '.';
import { Tristate } from '../../core';

export abstract class ColliderBase implements Collider {
  constructor(public readonly fallback?: Collider) {
  }

  // @ts-ignore - unused param.
  protected isCollidingCore(shapes: ShapePair): boolean | undefined { return undefined; }
  // @ts-ignore - unused param.
  protected calcContactCore(shapes: ShapePair): Tristate<Contact> { return undefined; }

  isColliding(shapes: ShapePair): boolean | undefined {
    const result = this.isCollidingCore(shapes);

    return result !== undefined
      ? result
      : this.fallback && this.fallback.isColliding(shapes);
  }

  calcContact(shapes: ShapePair): Tristate<Contact> {
    const result = this.calcContactCore(shapes);

    if (result === null) return result;

    return result || (this.fallback && this.fallback.calcContact(shapes));
  }
}
