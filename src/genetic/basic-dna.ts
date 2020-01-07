import { Gene } from '.';

export class BasicDNA<TGene extends Gene> {
  constructor(public genes: TGene[]) {
  }

  fitness: number = 0;

  toString() { return this.genes.map(g => g.toString()).join(""); }
}
