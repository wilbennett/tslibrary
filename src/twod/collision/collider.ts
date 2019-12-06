import { ClipCallback, Clipper, Contact, ShapePair } from '.';
import { Tristate } from '../../core';
import { Simplex } from '../shapes';

export type ColliderState = {
  simplices?: Simplex[];
  contact?: Contact;
};

export type ColliderCallback = (state: ColliderState) => void;

export interface Collider {
  clipper?: Clipper;

  isColliding(pair: ShapePair, callback?: ColliderCallback): boolean | undefined;
  calcContact(pair: ShapePair, result?: Tristate<Contact>, calcDistance?: boolean): Tristate<Contact>;

  calcContactProgress(
    shapes: ShapePair,
    callback: ColliderCallback,
    clipCallback: ClipCallback,
    contact?: Tristate<Contact>,
    calcDistance?: boolean): Tristate<Contact>;
}
