import { NamedStrategyBase } from '..';
import { FitnessModifierStrategy } from '../..';

export class SquaredFitnessModifier extends NamedStrategyBase implements FitnessModifierStrategy {
  static strategyName = "Squared Fitness";

  modifyFitness(fitness: number): number { return fitness * fitness; }
}
