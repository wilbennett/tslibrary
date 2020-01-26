import { FitnessKind, FitnessModifierStrategy, FitnessStrategy, Gene, NamedStrategyBase, TypedDNA } from '.';

export class OrderedErrorFitness<TGene extends Gene> extends NamedStrategyBase implements FitnessStrategy<TGene> {
  constructor(public maxError: number) {
    super();
  }

  calcFitness(dna: TypedDNA<TGene>, target: TypedDNA<TGene>, fitnessKind: FitnessKind, modifier?: FitnessModifierStrategy): number {
    const genes = dna.genes;
    const targetGenes = target.genes;
    const count = targetGenes.length;
    const maxError = this.maxError;
    let score = 0;

    if (count === 0) {
      dna.fitness = fitnessKind === FitnessKind.fitness ? 1 : 0;
      return dna.fitness;
    }

    for (let i = 0; i < count; i++) {
      score += genes[i].calcError(targetGenes[i]);
    }

    dna.isMatch = fitnessKind === FitnessKind.fitness && score === maxError
      || fitnessKind === FitnessKind.error && score === 0;

    score = score / maxError;
    fitnessKind === FitnessKind.fitness && (score = 1 - score);
    dna.fitness = score;
    modifier && (dna.fitness = modifier.modifyFitness(dna.fitness));
    return dna.fitness;
  }
}
