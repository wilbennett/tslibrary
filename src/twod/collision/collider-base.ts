import { ClipCallback, Clipper, Collider, ColliderCallback, Contact, ShapePair } from '.';
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
  // @ts-ignore - unused param.
  protected isCollidingProgressCore(shapes: ShapePair, callback: ColliderCallback): boolean | undefined {
    return undefined;
  }
  protected calcContactProgressCore(
    // @ts-ignore - unused param.
    shapes: ShapePair,
    // @ts-ignore - unused param.
    callback: ColliderCallback,
    // @ts-ignore - unused param.
    result: Contact,
    // @ts-ignore - unused param.
    calcDistance: boolean): Tristate<Contact> {
    return undefined;
  }

  isColliding(shapes: ShapePair, callback?: ColliderCallback): boolean | undefined {
    const result = callback
      ? this.isCollidingProgressCore(shapes, callback)
      : this.isCollidingCore(shapes);

    return result !== undefined
      ? result
      : this.fallback && this.fallback.isColliding(shapes, callback);
  }

  calcContact(shapes: ShapePair, result?: Tristate<Contact>, calcDistance?: boolean): Tristate<Contact> {
    result || (result = shapes.contact);
    result = this.calcContactCore(shapes, result, !!calcDistance);

    if (result === undefined && this.fallback)
      return this.fallback.calcContact(shapes, result, calcDistance);

    if (result) {
      this.clipper && result.clipPoints(this.clipper);
      result.ensurePointOrder();
    }

    return result;
  }

  calcContactProgress(
    shapes: ShapePair,
    callback: ColliderCallback,
    clipCallback: ClipCallback,
    result?: Tristate<Contact>,
    calcDistance?: boolean): Tristate<Contact> {
    result || (result = shapes.contact);
    result = this.calcContactProgressCore(shapes, callback, result, !!calcDistance);

    if (result === undefined && this.fallback)
      return this.fallback.calcContactProgress(shapes, callback, clipCallback, result, calcDistance);

    result && this.clipper && result.clipPoints(this.clipper, clipCallback);

    return result;
  }
}
