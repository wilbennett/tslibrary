import { CrossoverStrategy, DNAFactory, Gene, NamedStrategyBase, TypedDNA, TypedGenePool } from '.';
import { MathEx } from '../core';

export class MidpointCrossover<TGene extends Gene> extends NamedStrategyBase implements CrossoverStrategy<TGene> {
  constructor(readonly dnaFactory: DNAFactory<TGene>) {
    super();
  }

  name: string = "Midpoint Crossover";

  crossover(genePool: TypedGenePool<TGene>, ...partners: TypedDNA<TGene>[]): TypedDNA<TGene> {
    const partnerGenesA = partners[0].genes;
    const partnerGenesB = partners[1].genes;
    const count = partnerGenesA.length;
    const child = this.dnaFactory.createDNA(new Array(count));
    const childGenes = child.genes;
    const midpoint = MathEx.randomInt(partnerGenesA.length - 1);

    for (let i = 0; i < midpoint; i++) {
      childGenes[i] = partnerGenesA[i];
    }

    for (let i = midpoint; i < count; i++) {
      if (genePool.isCompatibleWithAll(partnerGenesB[i], childGenes, i))
        childGenes[i] = partnerGenesB[i];
      else
        childGenes[i] = partnerGenesA[i];
    }

    return child;
  }
}
