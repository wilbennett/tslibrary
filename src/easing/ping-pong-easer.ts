import { EaserDecorator, TypedEaser, EaserValueCallback, EaserCallback } from ".";

export class PingPongEaser<T> extends EaserDecorator<T> {
    constructor(
        easer: TypedEaser<T>,
        onValueChanged?: EaserValueCallback<T>,
        onComplete?: EaserCallback
    ) {
        super(easer, onValueChanged, onComplete);

        this._duration = easer.duration * 2 + this._secondsPerFrame;
        this.init();
    }

    reset() {
        super.reset();
        this.easer.isReverse = false;
    }

    protected advanceEaser() {
        if (this.isComplete) return;

        if (!this.easer.moveNext()) {
            this.easer.reverse();
            this.easer.reset();
            // Can add option to control whether the reverse starts
            // immediately or not (Move to time 1 or not - would need to adjust steps).
            this.easer.moveNext(); // time 0.
            // this.easer.moveNext(); // time 1.
        }
    }

    protected calcSteps() {
        return isFinite(this.easer.duration) ? this.easer.steps * 2 : Infinity;
    }
}