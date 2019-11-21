import { CollectionEaser, Easer, EaserCallback } from '.';

export class SequentialEaser extends CollectionEaser {
  constructor(
    easers: Easer[],
    onComplete?: EaserCallback
  ) {
    super(easers, onComplete);

    this.init();
  }

  moveNext() {
    if (!this.easer.moveNext())
      this.nextEaser();

    return super.moveNext();
  }

  protected calcSteps() {
    return this._easers.reduce((sum, easer) => sum + easer.steps, 0);
  }
}
