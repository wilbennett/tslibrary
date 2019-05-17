import { CollectionEaser, TypedEaser, EaserValueCallback, EaserCallback } from ".";

export class SequentialEaser<T> extends CollectionEaser<T> {
    constructor(
        easers: TypedEaser<T>[],
        onValueChanged?: EaserValueCallback<T>,
        onComplete?: EaserCallback
    ) {
        super(easers, onValueChanged, onComplete);

        this.init();
    }
}
