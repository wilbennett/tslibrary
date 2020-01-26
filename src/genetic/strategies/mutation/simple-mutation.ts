import { NamedStrategyBase } from '..';
import { Gene, MutationStrategy, TypedDNA, TypedGenePool } from '../..';

export class SimpleMutation<TGene extends Gene> extends NamedStrategyBase implements MutationStrategy<TGene> {
  static strategyName = "Simple Mutation";

  mutate(dna: TypedDNA<TGene>, genePool: TypedGenePool<TGene>, mutationRate: number) {
    const genes = dna.genes;
    const count = genes.length;

    for (let i = 0; i < count; i++) {
      if (Math.random() < mutationRate)
        genes[i] = genePool.createMutation(genes[i], genes);
    }
  }
}
