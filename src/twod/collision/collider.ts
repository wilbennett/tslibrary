import { Clipper, Contact, ShapePair } from '.';
import { Tristate } from '../../core';

export interface Collider {
  clipper?: Clipper;
  isColliding(pair: ShapePair): boolean | undefined;
  calcContact(pair: ShapePair, result?: Tristate<Contact>, calcDistance?: boolean): Tristate<Contact>;
}
