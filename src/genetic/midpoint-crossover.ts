import { CrossoverStrategy, DNAFactory, Gene, NamedStrategyBase, TypedDNA } from '.';
import { MathEx } from '../core';

export class MidpointCrossover<TGene extends Gene> extends NamedStrategyBase implements CrossoverStrategy<TGene> {
  constructor(readonly dnaFactory: DNAFactory<TGene>) {
    super();
  }

  name: string = "Midpoint Crossover";

  crossover(...partners: TypedDNA<TGene>[]): TypedDNA<TGene> {
    const partnerGenesA = partners[0].genes;
    const partnerGenesB = partners[1].genes;
    const count = partnerGenesA.length;
    const child = this.dnaFactory.createDNA(new Array(count));
    const childGenes = child.genes;
    const midpoint = MathEx.randomInt(partnerGenesA.length - 1);

    for (let i = 0; i < count; i++) {
      if (i > midpoint)
        childGenes[i] = partnerGenesA[i];
      else
        childGenes[i] = partnerGenesB[i];
    }

    return child;
  }
}
