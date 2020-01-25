import { Gene } from '.';

export class BasicGene<T extends object> implements Gene {
  constructor(public value: T) {
  }

  // @ts-ignore - unused param.
  calcError(other: Gene): number { return 0; }
  // @ts-ignore - unused param.
  combine(other: Gene): Gene | null { return null; }
  // @ts-ignore - unused param.
  isCompatibleWith(other: Gene): boolean { return true; }
  toString() { return this.value.toString(); }
}
