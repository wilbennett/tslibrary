import { FitnessModifierStrategy, NamedStrategyBase } from '.';

export class SquaredFitnessModifier extends NamedStrategyBase implements FitnessModifierStrategy {
  modifyFitness(fitness: number): number { return fitness * fitness; }
}
