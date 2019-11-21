import { CollectionEaser, EaserCallback, EaserValueCallback, TypedEaser } from '.';

export class RandomEaser extends CollectionEaser<any> {
  constructor(
    easers: TypedEaser<any>[],
    public randomOnReset: boolean = false,
    onValueChanged: EaserValueCallback<any> = () => { },
    onComplete: EaserCallback = () => { }
  ) {
    super(easers, onValueChanged, onComplete);

    this.chooseRandom();
  }

  reset() {
    super.reset();

    if (this.randomOnReset)
      this.chooseRandom();
  }

  moveNext() {
    if (!this.easer.moveNext())
      this.nextEaser();

    return super.moveNext();
  }

  protected _choosing = false;

  protected chooseRandom() {
    if (this._choosing) return;

    try {
      this._choosing = true;
      const index = Math.floor(Math.random() * this._easers.length);
      this._easeIndex = index;
      this._duration = this.easer.duration;
      this.init();
      this._easeIndex = index;
    } finally {
      this._choosing = false;
    }
  }

  protected calcSteps() { return this.easer.steps; }
  protected nextEaser() { }
}
