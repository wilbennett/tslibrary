import { Gene, SelectionStrategyBase } from '.';
import { MathEx } from '../core';

export class MonteCarloSelection<TGene extends Gene> extends SelectionStrategyBase<TGene> {
  name: string = "Dan Selection";
  get isInPlace() { return true; }

  protected selectFitness() {
    const population = this._population;
    // const bestFitness = this._bestFitness;

    let preventInfinite = 100;

    while (preventInfinite > 0) {
      --preventInfinite;
      const dna = MathEx.random(population);

      // if (Math.random() * bestFitness > dna.fitness) continue;
      if (Math.random() > dna.fitness) continue;

      return dna;
    }

    return population[0];
  }

  protected selectError() {
    const population = this._population;

    let preventInfinite = 100;

    while (preventInfinite > 0) {
      --preventInfinite;
      const dna = MathEx.random(population);

      if (Math.random() < dna.fitness) continue;

      return dna;
    }

    return population[0];
  }
}
