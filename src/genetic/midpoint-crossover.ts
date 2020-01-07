import { CrossoverStrategy, Gene, NamedStrategyBase, TypedDNA } from '.';
import { MathEx } from '../core';

export class MidpointCrossover<TGene extends Gene> extends NamedStrategyBase<TGene> implements CrossoverStrategy<TGene> {
  name: string = "Midpoint Crossover";

  crossover(...partners: TypedDNA<TGene>[]): TypedDNA<TGene> {
    const child = this.context.createDNA();// new StringDNA(new Array(partners[0].genes.length));
    const childGenes = child.genes;
    const partnerGenesA = partners[0].genes;
    const partnerGenesB = partners[1].genes;
    const count = partnerGenesA.length;
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
