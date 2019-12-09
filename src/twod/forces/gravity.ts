import { ForceSourceBase } from '.';
import { Integrator } from '..';
import { dir, Vector } from '../../vectors';

export class Gravity extends ForceSourceBase {
  constructor(public acceleration: Vector = dir(0, -9.8)) {
    super();
  }

  // @ts-ignore - unused param.
  protected processCore(integrator: Integrator, now: number, position: Vector, velocity: Vector) {
    integrator.applyForce(this.acceleration);
  }
}
