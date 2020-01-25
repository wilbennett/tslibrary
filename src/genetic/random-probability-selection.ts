import { Gene, NamedStrategyBase, SelectionStrategy, TypedDNA } from '.';

export class RandomProbabilitySelection<TGene extends Gene> extends NamedStrategyBase implements SelectionStrategy<TGene> {
  name: string = "Random Probability Selection";
  get isInPlace() { return true; }
  protected _population: TypedDNA<TGene>[] = [];
  protected _totalFitnessInv = 0;

  // @ts-ignore - unused param.
  initialize(population: TypedDNA<TGene>[], maxFitness: number, totalFitness: number) {
    this._population = population;
    this._totalFitnessInv = 1 / totalFitness;
  }

  select() {
    const population = this._population;
    let index = 0;
    let rand = Math.random();

    while (rand > 0) {
      rand -= population[index].fitness * this._totalFitnessInv;
      index++;
    }

    index--;
    return population[index];
  }
}
