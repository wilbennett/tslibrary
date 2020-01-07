import { Gene, NamedStrategyBase, ReproductionStrategy, TypedDNA } from '.';
import { MathEx } from '../core';

export class TwoParentReproduction<TGene extends Gene>
  extends NamedStrategyBase<TGene>
  implements ReproductionStrategy<TGene> {

  name: string = "Two Parent Reproduction";

  reproduce(matingPool: TypedDNA<TGene>[], population: TypedDNA<TGene>[], mutationRate: number) {
    const context = this.context;
    const count = population.length;

    for (let i = 0; i < count; i++) {
      const partnerA = MathEx.random(matingPool);
      const partnerB = MathEx.random(matingPool);
      const child = context.crossover(partnerA, partnerB);
      context.mutate(child, mutationRate);
      population[i] = child;
    }
  }
}
