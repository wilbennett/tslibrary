import { BasicGene } from '../../../genetic';

export class CharGene extends BasicGene<String> {
  calcError(other: CharGene): number {
    return Math.abs(this.value.charCodeAt(0) - other.value.charCodeAt(0));
  }
}
