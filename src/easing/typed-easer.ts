import { Easer, EaserCallback } from './easer';

export type EaserValueCallback<T> = (value: T, easer: TypedEaser<T>) => void;

export abstract class TypedEaser<T> extends Easer {
  constructor(duration: number, onComplete: EaserCallback = () => { }) {
    super(duration, onComplete);
  }

  abstract get value(): T;
  abstract get start(): T;
  abstract get end(): T;
  notifyDuplicates?: boolean;
  protected _lastNotifiedValue?: T;

  protected _onValueChanged: EaserValueCallback<T> = () => { };
  get onValueChanged() { return this._onValueChanged; }
  set onValueChanged(value) { this._onValueChanged = value; }
  get onComplete() { return this._onComplete; }
  set onComplete(value) { this._onComplete = value; }

  reset() {
    super.reset();
    this._lastNotifiedValue = undefined;
  }

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

  protected abstract calcValue(percent: number): T;
  // @ts-ignore - unused param.
  protected setValue(value: T) { }
  // @ts-ignore - unused param.

  protected notifyValue(percent: number) {
    const value = this.value;

    if (!this.notifyDuplicates && this._lastNotifiedValue === value && value !== undefined) return false;

    this._lastNotifiedValue = value;
    this._onValueChanged(value, this);
    return true;
  }
}
