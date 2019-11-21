import { CollectionEaser, Easer, EaserCallback } from '.';

export class ConcurrentEaser extends CollectionEaser {
  constructor(
    easers: Easer[],
    onComplete?: EaserCallback
  ) {
    super(easers, onComplete);

    let duration = this._easers.reduce((max, easer) => Math.max(max, easer.duration), 0);
    this._duration = duration;
    this.init();
  }

  protected _pendingEasers: Easer[] = [];

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
