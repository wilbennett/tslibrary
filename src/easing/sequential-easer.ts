import { CollectionEaser, EaserCallback, EaserValueCallback, TypedEaser } from '.';

export class SequentialEaser extends CollectionEaser<any> {
  constructor(
    easers: TypedEaser<any>[],
    onValueChanged?: EaserValueCallback<any>,
    onComplete?: EaserCallback
  ) {
    super(easers, onValueChanged, onComplete);

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
