export interface Gene {
  createMutation(others: Gene[], selfIndex: number): Gene;
}

export interface DNA {
  fitness: number;
  readonly genes: Gene[];
}

export interface NamedStrategy {
  name: string;
}

export interface CrossoverStrategy<TGene extends Gene> extends NamedStrategy {
  crossover(...partners: TypedDNA<TGene>[]): TypedDNA<TGene>;
}

export interface MutationStrategy<TGene extends Gene> extends NamedStrategy {
  mutate(dna: TypedDNA<TGene>, mutationRate: number): void;
}

export interface SelectionStrategy<TGene extends Gene> extends NamedStrategy {
  select(population: TypedDNA<TGene>[], matingPool: TypedDNA<TGene>[], algorithm: GeneticAlgorithm): void;
}

export interface ReproductionStrategy<TGene extends Gene> extends NamedStrategy {
  reproduce(matingPool: TypedDNA<TGene>[], population: TypedDNA<TGene>[], mutationRate: number): void;
}

export interface TypedDNA<TGene extends Gene> extends DNA {
  readonly genes: TGene[];
}

export interface GeneticContext<TGene extends Gene> {
  crossoverStrategy: CrossoverStrategy<TGene>;
  mutationStrategy: MutationStrategy<TGene>;
  createGene(): TGene;
  createGenes(count: number): TGene[];
  createDNA(): TypedDNA<TGene>;
  createPopulation(count: number): TypedDNA<TGene>[];
  calcFitness(dna: TypedDNA<TGene>): number;
  crossover(...partners: TypedDNA<TGene>[]): TypedDNA<TGene>;
  mutate(dna: TypedDNA<TGene>, mutationRate: number): void;
}

export interface GeneticAlgorithm {
  selectionStrategy: NamedStrategy;
  reproductionStrategy: NamedStrategy;
  context: GeneticContext<Gene>;
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
  selectionStrategy: SelectionStrategy<TGene>;
  reproductionStrategy: ReproductionStrategy<TGene>;
  context: GeneticContext<TGene>;
  population: TypedDNA<TGene>[];
  readonly bestDNA: TypedDNA<TGene>;
}
