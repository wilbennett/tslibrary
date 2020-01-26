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
    const result = Array.from({ length: count }, () => self.getRandomGene());
    this.ensureCompatibleGenes(result);
    return result;
  }

  populateGenes(genes: TGene[]): void {
    for (let i = 0; i < genes.length; i++) {
      let gene = this.getRandomGene();
      genes[i] = gene;
    }

    this.ensureCompatibleGenes(genes);
  }

  // @ts-ignore - unused param.
  createMutation(gene: TGene, allGenes: TGene[]): TGene {
    let mutation = this.getRandomGene();

    while (!this.isCompatibleWithAll(mutation, allGenes)) {
      mutation = this.getRandomGene();
    }

    return mutation;
  }

  isCompatibleWithAll(gene: TGene, allGenes: TGene[], count?: number) {
    count = count ?? allGenes.length;

    for (let i = 0; i < count; i++) {
      if (!gene.isCompatibleWith(allGenes[i])) return false;
    }

    return true;
  }

  protected ensureCompatibleGenes(genes: TGene[]) {
    const count = genes.length;

    for (let i = 1; i < count; i++) {
      while (!this.isCompatibleWithAll(genes[i], genes, i)) {
        genes[i] = this.getRandomGene();
      }
    }
  }
}
