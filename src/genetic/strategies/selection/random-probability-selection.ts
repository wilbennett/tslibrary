import { SelectionStrategyBase } from '.';
import { Gene } from '../..';

export class RandomProbabilitySelection<TGene extends Gene> extends SelectionStrategyBase<TGene> {
  static strategyName = "Random Probability";
  get isInPlace() { return true; }

  protected selectFitness() {
    const population = this._population;
    const totalFitnessInv = this._totalFitnessInv;
    let index = 0;
    let rand = Math.random();

    while (rand > 0 && index < population.length) {
      let fitness = population[index].fitness * totalFitnessInv;
      rand -= fitness;
      index++;
    }

    index--;
    return population[index];
  }

  protected selectError() {
    const population = this._population;
    const totalFitnessInv = this._totalFitnessInv;
    let index = 0;
    let rand = Math.random();

    while (rand > 0 && index < population.length) {
      let fitness = population[index].fitness * totalFitnessInv;
      //! BUG: This is NOT working.
      // TODO: Need to fix.
      fitness = 1 - fitness;
      rand -= fitness;
      index++;
    }

    index--;
    return population[index];
  }
}
