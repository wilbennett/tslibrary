import { EaseFunction, EaserCallback, EaserValueCallback, ValueEaser } from '.';
import { MathEx } from '../core';

export class ArrayEaser<T> extends ValueEaser<T> {
  constructor(
    public values: T[],
    duration: number,
    ease: EaseFunction,
    onValueChanged?: EaserValueCallback<T>,
    onComplete?: EaserCallback
  ) {
    super(values[0], values[values.length - 1], duration, ease, onValueChanged, onComplete);

    this.init();
  }

  protected calcChange() { return this.values.length; }

  protected calcValue(percent: number): T {
    let index = Math.round(MathEx.lerpc(0, this._change, this.ease(percent)));
    index = MathEx.clamp(index, 0, this.values.length - 1);
    return this.values[index];
  }
}