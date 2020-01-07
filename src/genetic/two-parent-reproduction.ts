import { Gene, NamedStrategyBase, ReproductionStrategy, SelectionStrategy, TypedDNA } from '.';

export class TwoParentReproduction<TGene extends Gene>
  extends NamedStrategyBase<TGene>
  implements ReproductionStrategy<TGene> {

  name: string = "Two Parent Reproduction";

  reproduce(newPopulation: TypedDNA<TGene>[], selectionStrategy: SelectionStrategy<TGene>, mutationRate: number) {
    const context = this.context;
    const count = newPopulation.length;

    for (let i = 0; i < count; i++) {
      const partnerA = selectionStrategy.select();
      const partnerB = selectionStrategy.select();
      const child = context.crossover(partnerA, partnerB);
      context.mutate(child, mutationRate);
      newPopulation[i] = child;
    }
  }
}
