import { Vector } from '../../vectors';

export class Projection {
  constructor() {
  }

  min: number = 0;
  max: number = 0;
  minPoint: Vector = Vector.empty;
  maxPoint: Vector = Vector.empty;

  calcOverlap(other: Projection) {
    return Math.min(this.max, other.max) - Math.max(this.min, other.min);
  }

  isContainment(other: Projection) {
    return this.min >= other.min && this.max <= other.max
      || other.min >= this.min && other.max <= this.max;
  }
}
