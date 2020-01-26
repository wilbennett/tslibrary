import { NamedStrategyBase } from '..';
import { FitnessModifierStrategy } from '../..';

export class NullFitnessModifier extends NamedStrategyBase implements FitnessModifierStrategy {
  static strategyName = "Null Fitness Mod";

  modifyFitness(fitness: number): number { return fitness; }
}
