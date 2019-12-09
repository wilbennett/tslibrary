import { ForceSource } from '.';
import { Integrator } from '..';
import { Vector } from '../../vectors';

export abstract class ForceSourceBase implements ForceSource {
  protected abstract processCore(integrator: Integrator, now: number, position: Vector, velocity: Vector): void;

  process(integrator: Integrator, now: number, position: Vector, velocity: Vector) {
    this.processCore(integrator, now, position, velocity);
  }
}
