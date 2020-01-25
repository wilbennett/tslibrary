import { FitnessModifierStrategy, NamedStrategyBase } from '.';

export class NullFitnessModifier extends NamedStrategyBase implements FitnessModifierStrategy {
  modifyFitness(fitness: number): number { return fitness; }
}
