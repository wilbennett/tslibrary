import { Clipper, Collider, Contact, ShapePair } from '.';
import { Tristate } from '../../core';

export abstract class ColliderBase implements Collider {
  constructor(public readonly fallback?: Collider) {
  }

  clipper?: Clipper;

  // @ts-ignore - unused param.
  protected isCollidingCore(shapes: ShapePair): boolean | undefined { return undefined; }
  // @ts-ignore - unused param.
  protected calcContactCore(shapes: ShapePair, result: Contact, calcDistance: boolean): Tristate<Contact> {
    return undefined;
  }

  isColliding(shapes: ShapePair): boolean | undefined {
    const result = this.isCollidingCore(shapes);

    return result !== undefined
      ? result
      : this.fallback && this.fallback.isColliding(shapes);
  }

  calcContact(shapes: ShapePair, result?: Tristate<Contact>, calcDistance?: boolean): Tristate<Contact> {
    result || (result = shapes.contact);
    result = this.calcContactCore(shapes, result, !!calcDistance);

    if (result === undefined && this.fallback) return this.fallback.calcContact(shapes);

    result && this.clipper && result.clipPoints(this.clipper);

    return result;
  }
}
