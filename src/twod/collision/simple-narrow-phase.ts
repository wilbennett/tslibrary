import { Collider, Contact, NarrowPhase, ShapePair } from '.';

export class SimpleNarrowPhase implements NarrowPhase {
  constructor(collider: Collider) {
    this.collider = collider;
  }

  collider: Collider;

  execute(pairs: ShapePair[]) {
    const collider = this.collider;

    return <Contact[]>pairs
      .map(pair => collider.calcContact(pair, undefined, true))
      .filter(contact => contact !== undefined && contact !== null);
  }
}