import { NamedStrategy } from '..';

export class NamedStrategyBase implements NamedStrategy {
  static strategyName = "<unnamed>";
  static get [Symbol.species]() { return this; }
  get name() {
    // @ts-ignore - species pattern.
    return this.constructor[Symbol.species].strategyName;
  }
}
