import { CollectionEaser, TypedEaser, EaserValueCallback, EaserCallback } from ".";

export class RandomEaser<T> extends CollectionEaser<T> {
    constructor(
        easers: TypedEaser<T>[],
        public randomOnReset: boolean = false,
        onValueChanged: EaserValueCallback<T> = () => { },
        onComplete: EaserCallback = () => { }
    ) {
        super(easers, onValueChanged, onComplete);

        this.chooseRandom();
    }

    reset() {
        super.reset();

        if (this.randomOnReset)
            this.chooseRandom();
    }

    protected _choosing = false;

    protected chooseRandom() {
        if (this._choosing) return;

        try {
            this._choosing = true;
            const index = Math.floor(Math.random() * this._easers.length);
            this._easeIndex = index;
            this._duration = this.easer.duration;
            this.init();
            this._easeIndex = index;
        } finally {
            this._choosing = false;
        }
    }

    protected calcSteps() { return this.easer.steps; }
    protected nextEaser() { }
}
