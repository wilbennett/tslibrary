import { ForceSourceBase } from '.';
import { dir, Vector } from '../../vectors';
import { Shape } from '../shapes';

const force = dir(0, 0);

export class Gravity extends ForceSourceBase {
  constructor(public acceleration: Vector = dir(0, -9.8)) {
    super();
  }

  // @ts-ignore - unused param.
  protected processCore(shape: Shape, now: number, position: Vector, velocity: Vector) {
    this.acceleration.scaleO(shape.massInfo.mass, force);
    shape.integrator.applyForce(force);
  }
}
