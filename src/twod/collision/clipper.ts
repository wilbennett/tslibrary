import { Contact, ContactPoint } from '.';
import { IPlane } from '..';

export type ClipState = {
  contact: Contact;
  clipPlane?: IPlane;
}

export type ClipCallback = (state: ClipState) => void;

export interface Clipper {
  clip(contact: Contact, callback?: ClipCallback): ContactPoint[];
}
