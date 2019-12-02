import { EaseFunction } from '.';

export type EaserCallback = (easer: Easer) => void;

export abstract class Easer {
  protected readonly _secondsPerFrame = 1 / 60;
  protected _stepAmt: number = 0;
  protected _stepsRemain: number = 0;
  protected _change: number = 0;

  constructor(
    protected _duration: number,
    protected _onComplete: EaserCallback = () => { }
  ) {
  }

  abstract get ease(): EaseFunction;
  abstract set ease(value: EaseFunction);
  get duration() { return this._duration; }

  protected _isComplete = false;
  get isComplete() { return this._isComplete; }
  set isComplete(value) { this._isComplete = value; }

  public _percent: number = 0;
  get percentComplete() { return Math.max(this._percent, 0); }
  public _steps: number = 0;
  get steps() { return this._steps; }

  get elapsedTime() {
    return (this._steps - this._stepsRemain) * this._secondsPerFrame - this._secondsPerFrame;
  }

  get remainTime() {
    return isFinite(this.duration)
      ? (1 - this.percentComplete) * this.duration
      : Infinity;
  }

  protected _isReverse: boolean = false;
  get isReverse() { return this._isReverse; }
  set isReverse(value) { this._isReverse = value; }
  get onComplete() { return this._onComplete; }
  set onComplete(value) { this._onComplete = value; }

  protected _tag?: any;
  get tag() { return this._tag; }
  set tag(value) { this._tag = value; }

  reset() {
    this.resetPercent();
    this._stepsRemain = this._steps;
    this._isComplete = false;
    this._notifiedComplete = false;
  }

  reverse() {
    this.isReverse = !this.isReverse;
    this.resetPercent();
  }

  abstract moveNext(): boolean;

  protected resetPercent() { this._percent = -this._stepAmt; }
  protected calcStepAmt() { return this._secondsPerFrame / this.duration; }
  protected calcSteps() { return Math.floor(this.duration / this._stepAmt / this.duration) + 1; }
  protected calcComplete() { return this._stepsRemain <= 0; }
  protected calcChange() { return 0; }

  protected init() {
    this._change = this.calcChange();
    this._stepAmt = this.calcStepAmt();
    this._steps = this.calcSteps();

    // HACK: Allow elapsed time calculation when easer never ends.
    if (isNaN(this._steps) || !isFinite(this._steps))
      this._steps = Math.floor(Number.MAX_SAFE_INTEGER);

    this.reset();
  }

  protected _notifiedComplete = false;

  protected notifyComplete() {
    if (this._notifiedComplete) return;

    this._notifiedComplete = true;
    this._onComplete(this);
  }
}
