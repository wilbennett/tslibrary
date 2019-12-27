import { ForceSource } from '.';
import { Vector } from '../../vectors';
import { Shape } from '../shapes';

export abstract class ForceSourceBase implements ForceSource {
  protected abstract processCore(shape: Shape, now: number, position: Vector, velocity: Vector): void;

  process(shape: Shape, now: number, position: Vector, velocity: Vector) {
    this.processCore(shape, now, position, velocity);
  }
}
