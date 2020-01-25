export interface Gene {
  // createMutation(others: Gene[], selfIndex: number): Gene;
  combine(other: Gene): Gene | null;
  calcError(other: Gene): number;
  isCompatibleWith(other: Gene): boolean;
}

export interface DNA {
  fitness: number;
  readonly genes: Gene[];

  clone(): DNA;
}

export interface TypedDNA<TGene extends Gene> extends DNA {
  readonly genes: TGene[];

  clone(): TypedDNA<TGene>;
}

export interface GenePool {
  getRandomGene(): Gene;
  getRandomGenes(count: number): Gene[];
  populateGenes(genes: Gene[]): void;
  createMutation(gene: Gene, allGenes: Gene[]): Gene;
}

export interface TypedGenePool<TGene extends Gene> extends GenePool {
  getRandomGene(): TGene;
  getRandomGenes(count: number): TGene[];
  populateGenes(genes: TGene[]): void;
  createMutation(gene: TGene, allGenes: TGene[]): TGene;
}

export interface NamedStrategy {
  name: string;
}

export interface CrossoverStrategy<TGene extends Gene> extends NamedStrategy {
  crossover(...partners: TypedDNA<TGene>[]): TypedDNA<TGene>;
}

export interface MutationStrategy<TGene extends Gene> extends NamedStrategy {
  mutate(dna: TypedDNA<TGene>, genePool: TypedGenePool<TGene>, mutationRate: number): void;
}

export interface SelectionStrategy<TGene extends Gene> extends NamedStrategy {
  readonly isInPlace: boolean;

  initialize(population: TypedDNA<TGene>[], maxFitness: number, totalFitness: number): void;
  select(): TypedDNA<TGene>;
}

export interface ReproductionStrategy<TGene extends Gene> extends NamedStrategy {
  reproduce(
    newPopulation: TypedDNA<TGene>[],
    genePool: TypedGenePool<TGene>,
    selectionStrategy: SelectionStrategy<TGene>,
    crossoverStrategy: CrossoverStrategy<TGene>,
    mutationStrategy: MutationStrategy<TGene>,
    mutationRate: number): void;
}

export interface FitnessStrategy<TGene extends Gene> extends NamedStrategy {
  calcFitness(dna: TypedDNA<TGene>, target: TypedDNA<TGene>, modifier?: FitnessModifierStrategy): number;
}

export interface FitnessModifierStrategy extends NamedStrategy {
  modifyFitness(fitness: number): number;
}

export interface DNAFactory<TGene extends Gene> {
  createDNA(genes: TGene[]): TypedDNA<TGene>;
}

export interface GeneticAlgorithm {
  crossoverStrategy: NamedStrategy;
  mutationStrategy: NamedStrategy;
  selectionStrategy: NamedStrategy;
  reproductionStrategy: NamedStrategy;
  fitnessStrategy: NamedStrategy;
  fitnessModifierStrategy?: NamedStrategy;
  population: DNA[];
  readonly generation: number;
  bestFitness: number;
  totalFitness: number;
  bestDNA: DNA;
  readonly isFinished: boolean;

  reset(): void;
  processGeneration(): void;
}

export interface TypedGeneticAlgorithm<TGene extends Gene> extends GeneticAlgorithm {
  dnaFactory: DNAFactory<TGene>;
  crossoverStrategy: CrossoverStrategy<TGene>;
  mutationStrategy: MutationStrategy<TGene>;
  selectionStrategy: SelectionStrategy<TGene>;
  reproductionStrategy: ReproductionStrategy<TGene>;
  fitnessStrategy: FitnessStrategy<TGene>;
  fitnessModifierStrategy?: FitnessModifierStrategy;
  population: TypedDNA<TGene>[];
  readonly bestDNA: TypedDNA<TGene>;
}
