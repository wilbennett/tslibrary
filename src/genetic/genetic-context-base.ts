import {
  BasicDNA,
  CrossoverStrategy,
  Gene,
  GeneticContext,
  MidpointCrossover,
  MutationStrategy,
  SimpleMutation,
} from '.';

type DNAType<T extends Gene> = BasicDNA<T>;

export abstract class GeneticContextBase<TGene extends Gene> implements GeneticContext<TGene> {
  constructor() {
    this.crossoverStrategy = new MidpointCrossover(this);
    this.mutationStrategy = new SimpleMutation(this);
  }

  crossoverStrategy: CrossoverStrategy<TGene>;
  mutationStrategy: MutationStrategy<TGene>;

  abstract createGene(): TGene;
  createGenes(count: number): TGene[] { return Array.from({ length: count }, () => this.createGene()); }

  abstract createDNA(genes?: TGene[]): DNAType<TGene>;
  createPopulation(count: number): DNAType<TGene>[] { return Array.from({ length: count }, () => this.createDNA()); }

  abstract calcFitness(dna: DNAType<TGene>): number;

  crossover(...partners: DNAType<TGene>[]) { return this.crossoverStrategy.crossover(...partners); }
  mutate(dna: DNAType<TGene>, mutationRate: number) { return this.mutationStrategy.mutate(dna, mutationRate); }
}
