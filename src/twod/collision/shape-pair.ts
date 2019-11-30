import { Contact } from '.';
import { Shape } from '../shapes';

export type ShapePairCustomData = { [index: string]: any };

export class ShapePair {
  constructor(public readonly shapeA: Shape, public readonly shapeB: Shape) {
    this.contact = new Contact(this);
    this.customData = {};
  }

  contact: Contact;
  customData: ShapePairCustomData;

  equals(other: ShapePair) {
    return this.shapeA === other.shapeA && this.shapeB === other.shapeB
      || this.shapeA === other.shapeB && this.shapeB === other.shapeA;
  }
}
