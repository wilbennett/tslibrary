import { ForceProcessParams, ForceSource } from '.';
import { IWorld } from '..';

export abstract class ForceSourceBase implements ForceSource {
  startTime: number = 0;
  endTime: number = Infinity;

  // @ts-ignore - unused param.
  initialize(world: IWorld) { }
  // @ts-ignore - unused param.
  finalize(world: IWorld) { }
  isActive(time: number) { return time >= this.startTime && time <= this.endTime; }
  isExpired(time: number) { return time > this.endTime; }

  protected abstract processCore(params: ForceProcessParams): void;

  process(params: ForceProcessParams) {
    if (!this.isActive(params.now)) return;
    if (this.isExpired(params.now)) return;

    this.processCore(params);
  }
}
