import {
  DanSelection,
  Gene,
  GeneticContext,
  ReproductionStrategy,
  SelectionStrategy,
  TwoParentReproduction,
  TypedDNA,
  TypedGeneticAlgorithm,
} from '.';

export abstract class GeneticAlgorithmBase<TGene extends Gene> implements TypedGeneticAlgorithm<TGene> {
  constructor(readonly context: GeneticContext<TGene>, public populationSize: number, public mutationRate: number) {
    this.population = context.createPopulation(populationSize);

    this.bestDNA = this.population[0];
    this.selectionStrategy = new DanSelection(context);
    this.reproductionStrategy = new TwoParentReproduction(context);
  }

  selectionStrategy: SelectionStrategy<TGene>;
  reproductionStrategy: ReproductionStrategy<TGene>;
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

    // Selection.
    this.selectionStrategy.select(this.population, this._matingPool, this);
    this.isFinished = this.bestFitness === 1;

    if (this.isFinished) return;
    if (this._matingPool.length === 0) return;

    // Reproduction.
    this.reproductionStrategy.reproduce(this._matingPool, this.population, this.mutationRate);
  }
}
