import { ForceSourceBase } from '.';
import { dir, Vector } from '../../vectors';
import { Shape } from '../shapes';

export class Gravity extends ForceSourceBase {
  constructor(public acceleration: Vector = dir(0, -9.8)) {
    super();
  }

  // @ts-ignore - unused param.
  protected processCore(shape: Shape, now: number, position: Vector, velocity: Vector) {
    shape.integrator.applyForce(this.acceleration);
  }
}
