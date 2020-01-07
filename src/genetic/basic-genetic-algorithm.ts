import { Gene, GeneticContext, TypedDNA, TypedGeneticAlgorithm } from '.';
import { MathEx } from '../core';

export class BasicGeneticAlgorithm<TGene extends Gene> implements TypedGeneticAlgorithm<TGene> {
  constructor(readonly context: GeneticContext<TGene>, public populationSize: number, public mutationRate: number) {
    this.population = context.createPopulation(populationSize);

    this.bestDNA = this.population[0];
  }

  population: TypedDNA<TGene>[];
  generation = 0;
  bestFitness: number = -Infinity;
  totalFitness: number = 0;
  bestDNA: TypedDNA<TGene>;
  isFinished = false;
  protected _matingPool: TypedDNA<TGene>[] = [];

  reset() {
    this.population = this.context.createPopulation(this.populationSize);
    this.bestDNA = this.population[0];
    this.generation = 0;
    this.bestFitness = -Infinity;
    this.totalFitness = 0;
    this.isFinished = false;
  }

  processGeneration() {
    if (this.isFinished) return;

    this.generation++;
    const context = this.context;

    // Selection.
    const population = this.population;
    const matingPool = this._matingPool;
    matingPool.splice(0);

    let totalFitness = 0;
    let bestFitness = -Infinity;
    let bestDNA = population[0];

    for (let i = 0; i < population.length; i++) {
      const fitness = context.calcFitness(population[i]);
      totalFitness += fitness;

      if (fitness === 1) {
        this.isFinished = true;
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

    this.totalFitness = totalFitness;
    this.bestFitness = bestFitness;
    this.bestDNA = bestDNA;

    if (this.isFinished) return;
    if (matingPool.length === 0) return;

    // Reproduction.
    for (let i = 0; i < population.length; i++) {
      const partnerA = MathEx.random(matingPool);
      const partnerB = MathEx.random(matingPool);
      const child = context.crossover(partnerA, partnerB);
      context.mutate(child, this.mutationRate);
      this.population[i] = child;
    }
  }
}
