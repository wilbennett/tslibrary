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
    this._newPopulation = new Array(populationSize);
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
  protected _newPopulation: TypedDNA<TGene>[];

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

    // Calculate fitness.
    this.calcFitness();
    this.isFinished = this.bestFitness === 1;

    if (this.isFinished) return;

    // Selection.
    this.selectionStrategy.initialize(this.population);

    // Reproduction.
    if (this.selectionStrategy.isInPlace) {
      this.reproductionStrategy.reproduce(this._newPopulation, this.selectionStrategy, this.mutationRate);
      const temp = this.population;
      this.population = this._newPopulation;
      this._newPopulation = temp;
    } else {
      this.reproductionStrategy.reproduce(this.population, this.selectionStrategy, this.mutationRate);
    }
  }

  protected calcFitness() {
    const context = this.context;
    const population = this.population;
    const populationSize = population.length;
    let totalFitness = 0;
    let bestFitness = -Infinity;
    let bestDNA = population[0];

    for (let i = 0; i < populationSize; i++) {
      const dna = population[i];
      const fitness = context.calcFitness(dna);
      totalFitness += fitness;

      if (fitness === 1) {
        bestFitness = fitness;
        bestDNA = dna;
        break;
      }

      if (fitness > bestFitness) {
        bestFitness = fitness;
        bestDNA = dna;
      }
    }

    this.totalFitness = totalFitness;
    this.bestFitness = bestFitness;
    this.bestDNA = bestDNA;
  }
}
