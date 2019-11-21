import { Easer, EaserCallback } from '.';

export abstract class CollectionEaser extends Easer {
  constructor(
    protected _easers: Easer[],
    onComplete: EaserCallback = () => { }
  ) {
    super(1, onComplete);

    let duration = _easers.reduce((sum, easer) => sum + easer.duration, 0);
    duration += (_easers.length - 1) * this._secondsPerFrame;
    this._duration = duration;
  }

  protected _easeIndex: number = 0;
  get easer() { return this._easers[this._easeIndex]; }
  get ease() { return this.easer.ease; }
  // get value() { return this.easer.value; }
  // get start() { return this.easer.start; }
  // get end() { return this.easer.end; }

  reset() {
    super.reset();
    this._easers.forEach(easer => easer.reset());
    this._easeIndex = 0;
  }

  reverse() {
    super.reverse();
    this._easers.forEach(easer => easer.reverse());
    this._easers = this._easers.reverse();
  }

  protected _iterationsRun = 0;

  moveNext() {
    if (this._isComplete) {
      this.notifyComplete();
      return false;
    }

    this._stepsRemain--;
    this._percent = this._stepsRemain > 0 ? this._percent + this._stepAmt : 1;
    this._percent = Math.min(this._percent, 1);
    this._isComplete = this.calcComplete();

    return true;
  }

  protected nextEaser() {
    if (this._easeIndex >= this._easers.length - 1) return;

    this._easeIndex++;
    this.easer.moveNext();
  }

  // @ts-ignore - unused param.
  protected calcValue(percent: number): T { return this.easer.value; }
}