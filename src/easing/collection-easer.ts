import { TypedEaser, EaserValueCallback, EaserCallback } from ".";

export abstract class CollectionEaser<T> extends TypedEaser<T> {
    constructor(
        protected _easers: TypedEaser<T>[],
        onValueChanged: EaserValueCallback<T> = () => { },
        onComplete: EaserCallback = () => { }
    ) {
        super(1, onComplete);

        this.onValueChanged = onValueChanged;

        let duration = _easers.reduce((sum, easer) => sum + easer.duration, 0);
        duration += (_easers.length - 1) * this._secondsPerFrame;
        this._duration = duration;
    }

    protected _easeIndex: number = 0;
    get easer() { return this._easers[this._easeIndex]; }
    get ease() { return this.easer.ease; }
    get value() { return this.easer.value; }
    get start() { return this.easer.start; }
    get end() { return this.easer.end; }

    reset() {
        super.reset();
        this._easers.forEach(easer => easer.reset());
        this._easeIndex = 0;
    }

    reverse() {
        super.reverse();
        this._easers.forEach(easer => easer.reverse());
        this._easers = this._easers.reverse();
    }

    protected _iterationsRun = 0;

    moveNext() {
        if (!this.easer.moveNext())
            this.nextEaser();

        return super.moveNext();
    }

    protected calcSteps() {
        return this._easers.reduce((sum, easer) => sum + easer.steps, 0);
    }

    protected nextEaser() {
        if (this._easeIndex >= this._easers.length - 1) return;

        this._easeIndex++;
        this.easer.moveNext();
    }

    // @ts-ignore - unused param.
    protected calcValue(percent: number): T { return this.easer.value; }
}