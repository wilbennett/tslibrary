import { Gene, NamedStrategyBase, SelectionStrategy, TypedDNA } from '.';
import { MathEx } from '../core';
import { FitnessKind } from './genetic-types';

export class MonteCarloSelection<TGene extends Gene> extends NamedStrategyBase implements SelectionStrategy<TGene> {
  name: string = "Dan Selection";
  get isInPlace() { return true; }
  protected _population: TypedDNA<TGene>[] = [];
  protected _bestFitness = 0;

  // @ts-ignore - unused param.
  initialize(population: TypedDNA<TGene>[], bestFitness: number, totalFitness: number, fitnessKind: FitnessKind) {
    this._population = population;
    this._bestFitness = bestFitness;
    this.select = fitnessKind === FitnessKind.fitness ? this.selectFitness : this.selectError;
  }

  select = this.selectFitness;

  protected selectFitness() {
    const population = this._population;
    const bestFitness = this._bestFitness;

    let preventInfinite = 100;

    while (preventInfinite > 0) {
      --preventInfinite;
      const dna = MathEx.random(population);

      if (Math.random() * bestFitness > dna.fitness) continue;

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
