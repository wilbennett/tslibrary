export interface Gene {
  createMutation(others: Gene[], selfIndex: number): Gene;
}

export interface DNA {
  fitness: number;
  readonly genes: Gene[];
}

export interface TypedDNA<TGene extends Gene> extends DNA {
  readonly genes: TGene[];
}

export interface GeneticContext<TGene extends Gene> {
  createGene(): TGene;
  createGenes(count: number): TGene[];
  createDNA(): TypedDNA<TGene>;
  createPopulation(count: number): TypedDNA<TGene>[];
  calcFitness(dna: TypedDNA<TGene>): number;
  crossover(...partners: TypedDNA<TGene>[]): TypedDNA<TGene>;
  mutate(dna: TypedDNA<TGene>, mutationRate: number): void;
}

export interface GeneticAlgorithm {
  context: GeneticContext<Gene>;
  population: DNA[];
  readonly generation: number;
  readonly bestFitness: number;
  readonly totalFitness: number;
  readonly bestDNA: DNA;
  readonly isFinished: boolean;

  reset(): void;
  processGeneration(): void;
}

export interface TypedGeneticAlgorithm<TGene extends Gene> extends GeneticAlgorithm {
  context: GeneticContext<TGene>;
  population: TypedDNA<TGene>[];
  readonly bestDNA: TypedDNA<TGene>;
}
