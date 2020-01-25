import { Gene, TypedGenePool } from '.';
import { MathEx } from '../core';

export class GenePoolBase<TGene extends Gene> implements TypedGenePool<TGene> {
  constructor(genes: TGene[]) {
    this._pool = genes;
  }

  protected _pool: TGene[];

  getRandomGene(): TGene { return MathEx.random(this._pool); }

  getRandomGenes(count: number): TGene[] {
    const self = this;
    return Array.from({ length: count }, () => self.getRandomGene());
  }

  populateGenes(genes: TGene[]): void {
    for (let i = 0; i < genes.length; i++) {
      let gene = this.getRandomGene();
      genes[i] = gene;
    }
  }

  // @ts-ignore - unused param.
  createMutation(gene: TGene, allGenes: TGene[]): TGene {
    let mutation = this.getRandomGene();

    while (!this.isCompatibleWithAll(mutation, allGenes)) {
      mutation = this.getRandomGene();
    }

    return mutation;
  }

  protected isCompatibleWithAll(gene: TGene, allGenes: TGene[]) {
    return allGenes.every(g => gene.isCompatibleWith(g));
  }
}
