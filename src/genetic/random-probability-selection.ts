import { FitnessKind, Gene, NamedStrategyBase, SelectionStrategy, TypedDNA } from '.';

export class RandomProbabilitySelection<TGene extends Gene> extends NamedStrategyBase implements SelectionStrategy<TGene> {
  name: string = "Random Probability Selection";
  get isInPlace() { return true; }
  protected _population: TypedDNA<TGene>[] = [];
  protected _totalFitnessInv = 0;
  protected _fitnessKind = FitnessKind.fitness;

  // @ts-ignore - unused param.
  initialize(population: TypedDNA<TGene>[], bestFitness: number, totalFitness: number, fitnessKind: FitnessKind) {
    this._population = population;
    this._totalFitnessInv = 1 / totalFitness;
    this._fitnessKind = fitnessKind;
  }

  select() {
    const population = this._population;
    const fitnessKind = this._fitnessKind;
    const totalFitnessInv = this._totalFitnessInv;
    let index = 0;
    let rand = Math.random();

    while (rand > 0 && index < population.length) {
      let fitness = population[index].fitness;

      if (fitnessKind === FitnessKind.error) {
        //! BUG: This is NOT working.
        // TODO: Need to fix.
        fitness = 1 - fitness;
      }

      rand -= fitness * totalFitnessInv;
      index++;
    }

    index--;
    return population[index];
  }
}
