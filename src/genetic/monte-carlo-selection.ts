import { Gene, NamedStrategyBase, SelectionStrategy, TypedDNA } from '.';
import { MathEx } from '../core';

export class MonteCarloSelection<TGene extends Gene> extends NamedStrategyBase<TGene> implements SelectionStrategy<TGene> {
  name: string = "Dan Selection";
  get isInPlace() { return true; }
  protected _population: TypedDNA<TGene>[] = [];

  initialize(population: TypedDNA<TGene>[]) { this._population = population; }

  select() {
    const population = this._population;

    let preventInfinite = 10000;

    while (preventInfinite > 0) {
      --preventInfinite;
      const dna = MathEx.random(population);

      if (Math.random() > dna.fitness) continue;

      return dna;
    }

    return population[0];
  }
}
