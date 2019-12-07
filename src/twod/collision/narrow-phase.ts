import { Collider, Contact, ShapePair } from '.';


export interface NarrowPhase {
  collider: Collider;

  execute(pairs: ShapePair[]): Contact[];
}
