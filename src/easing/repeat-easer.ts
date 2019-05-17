import { EaserDecorator, TypedEaser, EaserValueCallback, EaserCallback } from ".";

export class RepeatEaser<T> extends EaserDecorator<T> {
    constructor(
        easer: TypedEaser<T>,
        public readonly count: number = 1,
        onValueChanged?: EaserValueCallback<T>,
        onComplete?: EaserCallback
    ) {
        super(easer, onValueChanged, onComplete);

        this.count = Math.max(count, 0);

        this._duration = isFinite(this.count)
            ? this._duration * (this.count + 1) + (this._secondsPerFrame * this.count)
            : Infinity;

        this.init();
    }

    protected advanceEaser() {
        if (this.isComplete) return;

        if (!this.easer.moveNext()) {
            this.easer.reset();
            this.easer.moveNext();
        }
    }

    protected calcSteps() {
        return isFinite(this.easer.duration)
            ? this.easer.steps * (this.count + 1)
            : Infinity;
    }
}
