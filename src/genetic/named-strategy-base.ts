import { Gene, GeneticContext, NamedStrategy } from '.';

export class NamedStrategyBase<TGene extends Gene> implements NamedStrategy {
  constructor(readonly context: GeneticContext<TGene>) {
  }

  name = "<unnamed>";
}
