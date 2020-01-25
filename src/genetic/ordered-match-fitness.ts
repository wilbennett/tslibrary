import { FitnessKind, FitnessModifierStrategy, FitnessStrategy, Gene, NamedStrategyBase, TypedDNA } from '.';

export class OrderedMatchFitness<TGene extends Gene> extends NamedStrategyBase implements FitnessStrategy<TGene> {
  calcFitness(dna: TypedDNA<TGene>, target: TypedDNA<TGene>, fitnessKind: FitnessKind, modifier?: FitnessModifierStrategy): number {
    const genes = dna.genes;
    const targetGenes = target.genes;
    const count = targetGenes.length;
    let score = 0;

    if (count === 0) {
      dna.fitness = fitnessKind === FitnessKind.fitness ? 1 : 0;
      return dna.fitness;
    }

    for (let i = 0; i < count; i++) {
      genes[i].calcError(targetGenes[i]) === 0 && (score++);
    }

    dna.isMatch = score === count;
    fitnessKind === FitnessKind.error && (score = count - score);
    score = score / count;
    dna.fitness = score;
    modifier && (dna.fitness = modifier.modifyFitness(dna.fitness));
    return dna.fitness;
  }
}
