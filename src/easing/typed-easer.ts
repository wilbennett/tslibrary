import { Easer, EaserCallback } from './easer';

export type EaserValueCallback<T> = (value: T, easer: TypedEaser<T>) => void;

export abstract class TypedEaser<T> extends Easer {
  constructor(duration: number, onComplete: EaserCallback = () => { }) {
    super(duration, onComplete);
  }

  abstract get value(): T;
  abstract get start(): T;
  abstract get end(): T;

  protected _onValueChanged: EaserValueCallback<T> = () => { };
  get onValueChanged() { return this._onValueChanged; }
  set onValueChanged(value) { this._onValueChanged = value; }
  get onComplete() { return this._onComplete; }
  set onComplete(value) { this._onComplete = value; }

  moveNext() {
    if (this._isComplete) {
      this.notifyComplete();
      return false;
    }

    this._stepsRemain--;
    this._percent = this._stepsRemain > 0 ? this._percent + this._stepAmt : 1;
    this._percent = Math.min(this._percent, 1);
    const percent = this.isReverse ? 1 - this._percent : this._percent;
    this.setValue(this.calcValue(percent));
    this._isComplete = this.calcComplete();

    this.notifyValue(percent);
    return true;
  }

  protected init() {
    this._change = this.calcChange();
    this._stepAmt = this.calcStepAmt();
    this._steps = this.calcSteps();

    // HACK: Allow elapsed time calculation when easer never ends.
    if (isNaN(this._steps) || !isFinite(this._steps))
      this._steps = Math.floor(Number.MAX_SAFE_INTEGER);

    this.reset();
  }

  protected abstract calcValue(percent: number): T;
  // @ts-ignore - unused param.
  protected setValue(value: T) { }
  // @ts-ignore - unused param.
  protected notifyValue(percent: number) { this._onValueChanged(this.value, this); }
}
