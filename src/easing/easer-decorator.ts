import { ValueEaser, TypedEaser, EaserValueCallback, EaserCallback } from ".";

export abstract class EaserDecorator<T> extends ValueEaser<T> {
    constructor(
        public readonly easer: TypedEaser<T>,
        onValueChanged?: EaserValueCallback<T>,
        onComplete?: EaserCallback
    ) {
        super(
            easer.start,
            easer.end,
            easer.duration,
            easer.ease,
            onValueChanged,
            onComplete);
    }

    reset() {
        super.reset();
        this.easer.reset();
    }

    reverse() {
        super.reverse();
        this.easer.reverse();
    }

    moveNext() {
        this.advanceEaser();
        return super.moveNext();
    }

    protected advanceEaser() { this.easer.moveNext(); }
    protected calcStepAmt() { return 1 / this.calcSteps(); }
    protected calcSteps() { return this.easer.steps; }

    // @ts-ignore - unused param.
    protected calcValue(percent: number): T { return this.easer.value; }
}