import { SelectionStrategyBase } from '.';
import { Gene, TypedDNA } from '../..';
import { MathEx } from '../../../core';
import { FitnessKind } from '../../genetic-types';

export class DanSelection<TGene extends Gene> extends SelectionStrategyBase<TGene> {
  static strategyName = "Dan Selection";
  get isInPlace() { return false; }
  protected _matingPool: TypedDNA<TGene>[] = [];

  initialize(population: TypedDNA<TGene>[], maxFitness: number, totalFitness: number, fitnessKind: FitnessKind) {
    super.initialize(population, maxFitness, totalFitness, fitnessKind);

    const matingPool = this._matingPool;
    const count = population.length;

    for (let i = 0; i < count; i++) {
      const dna = population[i];
      const fitness = fitnessKind === FitnessKind.fitness ? dna.fitness : 1 - dna.fitness;
      const n = Math.max(Math.floor(fitness * 100), 1);

      for (let j = 0; j < n; j++) {
        matingPool[j] = dna;
      }
    }
  }

  protected selectFitness() { return MathEx.random(this._matingPool) || this._population[0]; }
  protected selectError() { return MathEx.random(this._matingPool) || this._population[0]; }
}
