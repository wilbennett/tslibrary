import {
  CrossoverStrategy,
  DanSelection,
  DNAFactory,
  FitnessModifierStrategy,
  FitnessStrategy,
  Gene,
  MidpointCrossover,
  MutationStrategy,
  OrderedMatchFitness,
  ReproductionStrategy,
  SelectionStrategy,
  SimpleMutation,
  TwoParentReproduction,
  TypedDNA,
  TypedGenePool,
  TypedGeneticAlgorithm,
} from '.';

export abstract class GeneticAlgorithmBase<TGene extends Gene> implements TypedGeneticAlgorithm<TGene> {
  constructor(
    readonly dnaFactory: DNAFactory<TGene>,
    readonly genePool: TypedGenePool<TGene>,
    public populationSize: number,
    public mutationRate: number,
    public target: TypedDNA<TGene>) {
    this._newPopulation = new Array(populationSize);
    this.crossoverStrategy = new MidpointCrossover(this.dnaFactory);
    this.mutationStrategy = new SimpleMutation();
    this.selectionStrategy = new DanSelection();
    this.reproductionStrategy = new TwoParentReproduction();
    this.fitnessStrategy = new OrderedMatchFitness();

    this.population = this.createPopulation(populationSize);
    this.bestDNA = this.population[0];
  }

  crossoverStrategy: CrossoverStrategy<TGene>;
  mutationStrategy: MutationStrategy<TGene>;
  selectionStrategy: SelectionStrategy<TGene>;
  reproductionStrategy: ReproductionStrategy<TGene>;
  fitnessStrategy: FitnessStrategy<TGene>;
  fitnessModifierStrategy?: FitnessModifierStrategy;
  population: TypedDNA<TGene>[];
  generation = 0;
  bestFitness: number = -Infinity;
  totalFitness: number = 0;
  bestDNA: TypedDNA<TGene>;
  isFinished = false;
  protected _newPopulation: TypedDNA<TGene>[];

  reset() {
    this.population = this.createPopulation(this.populationSize);
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
    this.selectionStrategy.initialize(this.population, this.bestFitness, this.totalFitness);

    // Reproduction.
    if (this.selectionStrategy.isInPlace) {
      this.reproductionStrategy.reproduce(
        this._newPopulation,
        this.genePool,
        this.selectionStrategy,
        this.crossoverStrategy,
        this.mutationStrategy,
        this.mutationRate);

      const temp = this.population;
      this.population = this._newPopulation;
      this._newPopulation = temp;
    } else {
      this.reproductionStrategy.reproduce(
        this.population,
        this.genePool,
        this.selectionStrategy,
        this.crossoverStrategy,
        this.mutationStrategy,
        this.mutationRate);
    }
  }

  protected calcFitness() {
    const fitnessStrategy = this.fitnessStrategy;
    const target = this.target;
    const fitnessModifier = this.fitnessModifierStrategy;
    const population = this.population;
    const populationSize = population.length;
    let totalFitness = 0;
    let bestFitness = -Infinity;
    let bestDNA = population[0];

    for (let i = 0; i < populationSize; i++) {
      const dna = population[i];
      const fitness = fitnessStrategy.calcFitness(dna, target, fitnessModifier);
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

  protected createPopulation(count: number): TypedDNA<TGene>[] {
    const factory = this.dnaFactory;
    const pool = this.genePool;
    const geneCount = this.target.genes.length;
    return Array.from({ length: count }, () => factory.createDNA(pool.getRandomGenes(geneCount)));
  }
}
