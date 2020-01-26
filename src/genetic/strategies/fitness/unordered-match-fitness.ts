import { NamedStrategyBase } from '..';
import { FitnessKind, FitnessModifierStrategy, FitnessStrategy, Gene, TypedDNA } from '../..';

export class UnorderedMatchFitness<TGene extends Gene> extends NamedStrategyBase implements FitnessStrategy<TGene> {
  static strategyName = "Unordered Match";

  calcFitness(dna: TypedDNA<TGene>, target: TypedDNA<TGene>, fitnessKind: FitnessKind, modifier?: FitnessModifierStrategy): number {
    const genes = dna.genes;
    const targetGenes = target.genes;
    const geneCount = genes.length;
    const targetCount = targetGenes.length;
    let score = 0;

    if (geneCount === 0) {
      dna.fitness = fitnessKind === FitnessKind.fitness ? 1 : 0;
      return dna.fitness;
    }

    for (let i = 0; i < geneCount; i++) {
      const gene = genes[i];
      targetGenes.find((_, gi) => gene.calcError(targetGenes[gi]) === 0) && (score++);
    }

    score = Math.min(score, targetCount);
    dna.isMatch = score === targetCount;
    score = score / targetCount;
    fitnessKind === FitnessKind.error && (score = 1 - score);
    dna.fitness = score;
    modifier && (dna.fitness = modifier.modifyFitness(dna.fitness));
    return dna.fitness;
  }
}
