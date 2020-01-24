import { Gene, TypedDNA } from '.';

export class BasicDNA<TGene extends Gene> implements TypedDNA<TGene> {
  constructor(public genes: TGene[]) {
  }

  fitness: number = 0;

  clone(): TypedDNA<TGene> {
    const result = new BasicDNA<TGene>(this.genes.slice());
    result.fitness = this.fitness;
    return result;
  }

  toString() { return this.genes.map(g => g.toString()).join(""); }
}
