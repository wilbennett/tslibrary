import { FitnessModifierStrategy, FitnessStrategy, Gene, NamedStrategyBase, TypedDNA } from '.';

export class OrderedMatchFitness<TGene extends Gene> extends NamedStrategyBase implements FitnessStrategy<TGene> {
  calcFitness(dna: TypedDNA<TGene>, target: TypedDNA<TGene>, modifier?: FitnessModifierStrategy): number {
    const genes = dna.genes;
    const targetGenes = target.genes;
    const count = genes.length;
    let score = 0;

    if (count === 0) {
      dna.fitness = 1;
      return dna.fitness;
    }

    for (let i = 0; i < count; i++) {
      genes[i].calcError(targetGenes[i]) === 0 && (score++);
    }

    dna.fitness = score / targetGenes.length;
    modifier && (dna.fitness = modifier.modifyFitness(dna.fitness));
    return dna.fitness;
  }
}
