import { Contact, ShapePair } from '.';
import { Tristate } from '../../core';

export interface Collider {
  isColliding(pair: ShapePair): Tristate<boolean>;
  calcContact(pair: ShapePair, priorContact?: Contact): Tristate<Contact>;
}
