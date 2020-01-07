import { Gene, GeneticAlgorithm, NamedStrategyBase, SelectionStrategy, TypedDNA } from '.';

export class DanSelection<TGene extends Gene> extends NamedStrategyBase<TGene> implements SelectionStrategy<TGene> {
  name: string = "Dan Selection";

  select(population: TypedDNA<TGene>[], matingPool: TypedDNA<TGene>[], algorithm: GeneticAlgorithm) {
    const context = this.context;
    matingPool.splice(0);
    let totalFitness = 0;
    let bestFitness = -Infinity;
    let bestDNA = population[0];

    for (let i = 0; i < population.length; i++) {
      const fitness = context.calcFitness(population[i]);
      totalFitness += fitness;

      if (fitness === 1) {
        bestFitness = fitness;
        bestDNA = population[i];
        break;
      }

      if (fitness > bestFitness) {
        bestFitness = fitness;
        bestDNA = population[i];
      }

      const n = Math.max(Math.floor(fitness * 100), 1);

      for (let j = 0; j < n; j++) {
        matingPool.push(population[i]);
      }
    }

    algorithm.totalFitness = totalFitness;
    algorithm.bestFitness = bestFitness;
    algorithm.bestDNA = bestDNA;
  }
}
