import { Gene, NamedStrategyBase, SelectionStrategy, TypedDNA } from '.';
import { MathEx } from '../core';

export class DanSelection<TGene extends Gene> extends NamedStrategyBase<TGene> implements SelectionStrategy<TGene> {
  name: string = "Dan Selection";
  get isInPlace() { return false; }
  protected _population: TypedDNA<TGene>[] = [];
  protected _matingPool: TypedDNA<TGene>[] = [];

  initialize(population: TypedDNA<TGene>[]) {
    this._population = population;
    const matingPool = this._matingPool;
    const count = population.length;

    for (let i = 0; i < count; i++) {
      const dna = population[i];
      const fitness = dna.fitness;
      const n = Math.max(Math.floor(fitness * 100), 1);

      for (let j = 0; j < n; j++) {
        matingPool[j] = dna;
      }
    }
  }

  select() { return MathEx.random(this._matingPool) || this._population[0]; }
}
