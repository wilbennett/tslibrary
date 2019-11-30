import { Contact, ShapePair } from '.';
import { Tristate } from '../../core';

export interface Collider {
  isColliding(pair: ShapePair): boolean | undefined;
  calcContact(pair: ShapePair, result?: Contact): Tristate<Contact>;
}
