import { ValueEaser, EaserValueCallback, EaserCallback, Ease } from ".";

export class DelayEaser extends ValueEaser<number> {
    constructor(
        duration: number,
        onValueChanged?: EaserValueCallback<number>,
        onComplete?: EaserCallback
    ) {
        super(0, 1, duration, Ease.linear, onValueChanged, onComplete);

        this.init();
    }

    // @ts-ignore - unused param.
    protected calcValue(percent: number): number {
        return this._steps - this._stepsRemain - 1;
    }
}