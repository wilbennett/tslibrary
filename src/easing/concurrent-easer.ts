import { CollectionEaser, EaserCallback, EaserValueCallback, TypedEaser } from '.';

export class ConcurrentEaser extends CollectionEaser<any> {
  constructor(
    easers: TypedEaser<any>[],
    onValueChanged?: EaserValueCallback<any>,
    onComplete?: EaserCallback
  ) {
    super(easers, onValueChanged, onComplete);

    let duration = this._easers.reduce((max, easer) => Math.max(max, easer.duration), 0);
    this._duration = duration;
    this.init();
  }

  protected _pendingEasers: TypedEaser<any>[] = [];

  reset() {
    super.reset();
    this._pendingEasers = [...this._easers];
  }

  moveNext() {
    const pending = this._pendingEasers;

    for (let i = pending.length - 1; i >= 0; i--) {
      const easer = pending[i];

      if (!easer.moveNext())
        pending.remove(easer);
    }

    return super.moveNext();
  }
}
