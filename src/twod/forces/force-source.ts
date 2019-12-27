import { Vector } from '../../vectors';
import { Shape } from '../shapes';


export interface ForceSource {
  process(shape: Shape, now: number, position: Vector, velocity: Vector): void;
}
