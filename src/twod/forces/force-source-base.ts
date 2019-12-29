import { ForceSource } from '.';
import { IWorld } from '..';
import { Vector } from '../../vectors';
import { Shape } from '../shapes';

export abstract class ForceSourceBase implements ForceSource {
  startTime: number = 0;
  endTime: number = Infinity;

  // @ts-ignore - unused param.
  initialize(world: IWorld) { }
  // @ts-ignore - unused param.
  finalize(world: IWorld) { }
  isActive(time: number) { return time >= this.startTime && time <= this.endTime; }
  isExpired(time: number) { return time > this.endTime; }

  protected abstract processCore(shape: Shape, now: number, position: Vector, velocity: Vector): void;

  process(shape: Shape, now: number, position: Vector, velocity: Vector) {
    if (!this.isActive(now)) return;
    if (this.isExpired(now)) return;

    this.processCore(shape, now, position, velocity);
  }
}
