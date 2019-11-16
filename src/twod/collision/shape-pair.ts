import { Shape } from '../shapes';

export class ShapePair {
  constructor(public readonly first: Shape, public readonly second: Shape) {
  }

  equals(other: ShapePair) {
    return this.first === other.first && this.second === other.second
      || this.first === other.second && this.second === other.first;
  }
}
