import { Gene, NamedStrategyBase, SelectionStrategy, TypedDNA } from '.';
import { MathEx } from '../core';
import { FitnessKind } from './genetic-types';

export class DanSelection<TGene extends Gene> extends NamedStrategyBase implements SelectionStrategy<TGene> {
  name: string = "Dan Selection";
  get isInPlace() { return false; }
  protected _population: TypedDNA<TGene>[] = [];
  protected _matingPool: TypedDNA<TGene>[] = [];

  // @ts-ignore - unused param.
  initialize(population: TypedDNA<TGene>[], maxFitness: number, totalFitness: number, fitnessKind: FitnessKind) {
    this._population = population;
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

  select() { return MathEx.random(this._matingPool) || this._population[0]; }
}
