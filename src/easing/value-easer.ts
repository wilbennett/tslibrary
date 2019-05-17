import { TypedEaser, EaseFunction, EaserCallback, EaserValueCallback } from ".";

export abstract class ValueEaser<T> extends TypedEaser<T> {
    protected _change: number = 0;

    constructor(
        protected _start: T,
        protected _end: T,
        duration: number,
        protected _ease: EaseFunction,
        onValueChanged: EaserValueCallback<T> = () => { },
        onComplete: EaserCallback = () => { }
    ) {
        super(duration, onComplete);

        this.onValueChanged = onValueChanged;
        this._value = this.start;
    }

    protected _value: T;
    get value() { return this._value; }
    get start() { return this._start; }
    get end() { return this._end; }
    get ease() { return this._ease; }

    reset() {
        super.reset();
        this._value = this.isReverse ? this.end : this.start;
    }

    protected setValue(value: T) { this._value = value; }
}
