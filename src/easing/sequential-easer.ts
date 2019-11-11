import { CollectionEaser, EaserCallback, EaserValueCallback, TypedEaser } from '.';

export class SequentialEaser<T> extends CollectionEaser<T> {
  constructor(
    easers: TypedEaser<T>[],
    onValueChanged?: EaserValueCallback<T>,
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
