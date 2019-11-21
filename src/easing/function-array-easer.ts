import { EaseFunction, EaserCallback, EaserValueCallback, ValueEaser } from '.';
import { MathEx } from '../core';

export type ArrayFunction = (percentComplete: number, isComplete: boolean) => void;

export class FunctionArrayEaser extends ValueEaser<ArrayFunction> {
  constructor(
    public values: ArrayFunction[],
    duration: number,
    ease: EaseFunction,
    onValueChanged?: EaserValueCallback<ArrayFunction>,
    onComplete?: EaserCallback
  ) {
    super(values[0], values[values.length - 1], duration, ease, onValueChanged, onComplete);

    this.init();
  }

  protected calcChange() { return this.values.length; }

  protected calcValue(percent: number): ArrayFunction {
    let index = Math.round(MathEx.lerpc(0, this._change, this.ease(percent)));
    index = MathEx.clamp(index, 0, this.values.length - 1);
    return this.values[index];
  }

  protected notifyValue(percent: number) {
    super.notifyValue(percent);

    this.value(percent, this.isComplete);
  }
}
