import { Vector } from '.';

export class UniqueVectorList {
  private _negative = Vector.create();

  constructor(public readonly excludeOppositeDirection: boolean = false) {

  }

  readonly items: Vector[] = [];

  clear() { this.items.splice(0); }

  add(vector: Vector) {
    if (this.items.find(v => v.equals(vector))) return;

    if (this.excludeOppositeDirection) {
      vector.negateO(this._negative);

      if (this.items.find(v => v.equals(this._negative))) return;
    }

    this.items.push(vector);
  }

  addVectors(vectors: Vector[]) { vectors.forEach(v => this.add(v)); }
}
