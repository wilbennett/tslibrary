import { ShapePair } from '.';
import { Vector } from '../../vectors';

export class ContactPoint {
  constructor(
    public point: Vector, // World.
    public depth: number) {
  }
};

// TODO: Add Contact ID.
export class Contact {
  constructor(public shapes: ShapePair, public normal: Vector) {
    this.points = [];
  }

  points: ContactPoint[];
}
