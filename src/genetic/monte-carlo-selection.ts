import { Gene, NamedStrategyBase, SelectionStrategy, TypedDNA } from '.';
import { MathEx } from '../core';

export class MonteCarloSelection<TGene extends Gene> extends NamedStrategyBase implements SelectionStrategy<TGene> {
  name: string = "Dan Selection";
  get isInPlace() { return true; }
  protected _population: TypedDNA<TGene>[] = [];
  protected _maxFitness = 0;

  // @ts-ignore - unused param.
  initialize(population: TypedDNA<TGene>[], maxFitness: number, totalFitness: number) {
    this._population = population;
    this._maxFitness = maxFitness;
  }

  select() {
    const population = this._population;
    const maxFitness = this._maxFitness;

    let preventInfinite = 10000;

    while (preventInfinite > 0) {
      --preventInfinite;
      const dna = MathEx.random(population);

      if (Math.random() * maxFitness > dna.fitness) continue;

      return dna;
    }

    return population[0];
  }
}
