import { NamedStrategyBase } from '..';
import { FitnessKind, Gene, SelectionStrategy, TypedDNA } from '../..';

export abstract class SelectionStrategyBase<TGene extends Gene> extends NamedStrategyBase implements SelectionStrategy<TGene> {
  get isInPlace() { return false; }
  protected _population: TypedDNA<TGene>[] = [];
  protected _bestFitness = 0;
  protected _totalFitness = 0;
  protected _totalFitnessInv = 0;
  protected _fitnessKind = FitnessKind.fitness;

  initialize(population: TypedDNA<TGene>[], bestFitness: number, totalFitness: number, fitnessKind: FitnessKind) {
    this._population = population;
    this._bestFitness = bestFitness;
    this._totalFitness = totalFitness;
    this._totalFitnessInv = 1 / totalFitness;
    this._fitnessKind = fitnessKind;
    this.select = fitnessKind === FitnessKind.fitness ? this.selectFitness : this.selectError;
  }

  select = this.selectFitness;

  protected abstract selectFitness(): TypedDNA<TGene>;
  protected abstract selectError(): TypedDNA<TGene>;
}
