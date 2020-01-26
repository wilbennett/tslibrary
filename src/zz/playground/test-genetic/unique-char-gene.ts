import { BasicGene } from '../../../genetic';

export class UniqueCharGene extends BasicGene<String> {
  calcError(other: UniqueCharGene): number {
    return Math.abs(this.value.charCodeAt(0) - other.value.charCodeAt(0));
  }

  isCompatibleWith(other: UniqueCharGene): boolean {
    return this.value !== other.value;
  }
}
