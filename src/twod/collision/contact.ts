import { ShapePair } from '.';
import { Vector } from '../../vectors';

export class ContactPoint {
  constructor(
    public point: Vector, // World.
    public depth: number) {
  }

  get isPenetrating() { return this.depth < 0; }
};

// TODO: Add Contact ID.
export class Contact {
  constructor(public shapes: ShapePair) {
    this.normal = Vector.createDirection(0, 0);
    this.points = [];
  }

  normal: Vector;
  points: ContactPoint[];
  get isContacting() { return this.points.length > 0; }

  reset() {
    this.points.splice(0);
  }
}
