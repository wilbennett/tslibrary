import { Gene, MutationStrategy, NamedStrategyBase, TypedDNA } from '.';

export class SimpleMutation<TGene extends Gene> extends NamedStrategyBase<TGene> implements MutationStrategy<TGene> {
  name: string = "Simple Mutation";

  mutate(dna: TypedDNA<TGene>, mutationRate: number) {
    const genes = dna.genes;
    const count = genes.length;

    for (let i = 0; i < count; i++) {
      if (Math.random() < mutationRate)
        genes[i] = <TGene>genes[i].createMutation(genes, i);
    }
  }
}
