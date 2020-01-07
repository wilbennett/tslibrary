import { Gene, GeneticContext } from '.';

export class BasicGene<T extends object> implements Gene {
  constructor(readonly context: GeneticContext<BasicGene<T>>, public value: T) {
  }

  // @ts-ignore - unused param.
  createMutation(others: Gene[], selfIndex: number) { return this.context.createGene(); }
  toString() { return this.value.toString(); }
}
