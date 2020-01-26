import {
  CrossoverStrategy,
  Gene,
  MutationStrategy,
  NamedStrategyBase,
  ReproductionStrategy,
  SelectionStrategy,
  TypedDNA,
  TypedGenePool,
} from '.';

export class TwoParentReproduction<TGene extends Gene>
  extends NamedStrategyBase
  implements ReproductionStrategy<TGene> {

  name: string = "Two Parent Reproduction";

  reproduce(
    newPopulation: TypedDNA<TGene>[],
    genePool: TypedGenePool<TGene>,
    selectionStrategy: SelectionStrategy<TGene>,
    crossoverStrategy: CrossoverStrategy<TGene>,
    mutationStrategy: MutationStrategy<TGene>,
    mutationRate: number) {
    const count = newPopulation.length;

    for (let i = 0; i < count; i++) {
      const partnerA = selectionStrategy.select();
      const partnerB = selectionStrategy.select();
      const child = crossoverStrategy.crossover(genePool, partnerA, partnerB);
      mutationStrategy.mutate(child, genePool, mutationRate);
      newPopulation[i] = child;
    }
  }
}
