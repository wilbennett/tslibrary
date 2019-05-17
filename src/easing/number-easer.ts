import { EaseFunction, EaserCallback, EaserValueCallback, ValueEaser } from '.';
import { MathEx } from '../core/mathex';

export class NumberEaser extends ValueEaser<number> {
    constructor(
        start: number,
        end: number,
        duration: number,
        ease: EaseFunction,
        onValueChanged?: EaserValueCallback<number>,
        onComplete?: EaserCallback
    ) {
        super(start, end, duration, ease, onValueChanged, onComplete);

        this.init();
    }

    protected calcChange() { return this.end - this.start; }

    protected calcValue(percent: number): number {
        return MathEx.lerpc(this.start, this._change, this.ease(percent));
    }
}