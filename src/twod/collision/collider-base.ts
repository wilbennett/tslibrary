import { Collider, Contact, ShapePair } from '.';
import { Tristate } from '../../core';

export abstract class ColliderBase implements Collider {
  constructor(public readonly fallback?: Collider) {
  }

  // @ts-ignore - unused param.
  protected isCollidingCore(pair: ShapePair): boolean | undefined { return undefined; }
  // @ts-ignore - unused param.
  protected calcContactCore(pair: ShapePair): Tristate<Contact> { return undefined; }

  isColliding(pair: ShapePair): boolean | undefined {
    const result = this.isCollidingCore(pair);

    return result !== undefined
      ? result
      : this.fallback && this.fallback.isColliding(pair);
  }

  calcContact(pair: ShapePair): Tristate<Contact> {
    const result = this.calcContactCore(pair);

    if (result === null) return result;

    return result || (this.fallback && this.fallback.calcContact(pair));
  }
}
