import {
  CrossoverStrategy,
  DanSelection,
  DNAFactory,
  FitnessKind,
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
    public target: TypedDNA<TGene>,
    geneCount?: number) {
    this._newPopulation = new Array(populationSize);
    this.crossoverStrategy = new MidpointCrossover(this.dnaFactory);
    this.mutationStrategy = new SimpleMutation();
    this.selectionStrategy = new DanSelection();
    this.reproductionStrategy = new TwoParentReproduction();
    this.fitnessStrategy = new OrderedMatchFitness();
    this.geneCount = geneCount ?? target.genes.length;

    this.population = this.createPopulation(populationSize, this.geneCount);
  }

  geneCount: number;
  crossoverStrategy: CrossoverStrategy<TGene>;
  mutationStrategy: MutationStrategy<TGene>;
  selectionStrategy: SelectionStrategy<TGene>;
  reproductionStrategy: ReproductionStrategy<TGene>;
  fitnessStrategy: FitnessStrategy<TGene>;
  fitnessModifierStrategy?: FitnessModifierStrategy;
  population: TypedDNA<TGene>[];
  generation = 0;
  fitnessKind: FitnessKind = FitnessKind.fitness;
  get bestFitness() { return this.bestDNA.fitness; }
  totalFitness: number = 0;
  protected _bestDNA?: TypedDNA<TGene>;
  get bestDNA() { return this._bestDNA ?? this.population[0]; }
  keepBest: boolean = true;
  isFinished = false;
  protected _newPopulation: TypedDNA<TGene>[];

  reset() {
    this.population = this.createPopulation(this.populationSize, this.geneCount);
    this._bestDNA = undefined;
    this.generation = 0;
    this.totalFitness = 0;
    this.isFinished = false;
  }

  processGeneration() {
    if (this.isFinished) return;

    this.generation++;
    const fitnessKind = this.fitnessKind;

    // Calculate fitness.
    if (fitnessKind === FitnessKind.fitness) {
      this.calcFitness();
      this.isFinished = this.bestDNA.isMatch || this.bestFitness === 1;
    } else {
      this.calcError();
      this.isFinished = this.bestDNA.isMatch || this.bestFitness === 0;
    }

    if (this.isFinished) return;

    this.selectionStrategy.initialize(this.population, this.bestFitness, this.totalFitness, fitnessKind);

    // Selection/Reproduction/Mutation.
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

  protected updateRawFitness() {
    const fitnessStrategy = this.fitnessStrategy;
    const target = this.target;
    const fitnessKind = this.fitnessKind;
    const fitnessModifier = this.fitnessModifierStrategy;
    const population = this.population;
    const populationSize = population.length;
    let totalFitness = 0;

    for (let i = 0; i < populationSize; i++) {
      const dna = population[i];
      const fitness = fitnessStrategy.calcFitness(dna, target, fitnessKind, fitnessModifier);
      totalFitness += fitness;
    }

    const totalFitnessInv = 1 / totalFitness;
    return totalFitnessInv;
  }

  protected calcFitness() {
    const fitnessStrategy = this.fitnessStrategy;
    const target = this.target;
    const fitnessKind = this.fitnessKind;
    const fitnessModifier = this.fitnessModifierStrategy;
    const population = this.population;
    const populationSize = population.length;
    let totalFitness = 0;
    let bestFitness = this.keepBest && this._bestDNA ? this._bestDNA.fitness : -Infinity;
    let bestDNA = this.bestDNA;

    for (let i = 0; i < populationSize; i++) {
      const dna = population[i];
      const fitness = fitnessStrategy.calcFitness(dna, target, fitnessKind, fitnessModifier);
      totalFitness += fitness;

      if (dna.isMatch) {
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
    this._bestDNA = bestDNA;
  }

  protected calcError() {
    const population = this.population;
    const populationSize = population.length;
    let totalFitness = 0;
    let bestFitness = this.keepBest && this._bestDNA ? this.bestDNA.fitness : Infinity;
    let bestDNA = this.bestDNA;
    // const totalFitnessInv = this.updateRawFitness();
    this.updateRawFitness();
    totalFitness = 0;

    for (let i = 0; i < populationSize; i++) {
      const dna = population[i];
      // const fitness = dna.fitness * totalFitnessInv;
      const fitness = dna.fitness;
      dna.fitness = fitness;
      totalFitness += fitness;

      if (fitness === 0) {
        bestFitness = fitness;
        bestDNA = dna;
        break;
      }

      if (fitness < bestFitness) {
        bestFitness = fitness;
        bestDNA = dna;
      }
    }

    this.totalFitness = totalFitness;
    this._bestDNA = bestDNA;
  }

  protected createPopulation(count: number, geneCount: number): TypedDNA<TGene>[] {
    const factory = this.dnaFactory;
    const pool = this.genePool;
    const result = Array.from({ length: count }, () => factory.createDNA(pool.getRandomGenes(geneCount)));
    return result;
  }
}
