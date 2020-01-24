import { Gene, GeneticContext } from '.';

export class BasicGene<T extends object> implements Gene {
  constructor(readonly context: GeneticContext<BasicGene<T>>, public value: T) {
  }

  // @ts-ignore - unused param.
  createMutation(others: Gene[], selfIndex: number) { return this.context.createGene(); }
  // @ts-ignore - unused param.
  combine(other: Gene): Gene | null { return null; }
  // @ts-ignore - unused param.
  calcError(other: Gene): number { return 0; }
  // @ts-ignore - unused param.
  isCompatibleWith(other: Gene): boolean { return true; }
  toString() { return this.value.toString(); }
}
