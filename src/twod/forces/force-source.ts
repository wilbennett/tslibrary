import { Integrator } from '..';
import { Vector } from '../../vectors';


export interface ForceSource {
  process(integrator: Integrator, now: number, position: Vector, velocity: Vector): void;
}
