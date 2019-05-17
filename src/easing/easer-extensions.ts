import { EaserCallback, EaserValueCallback, PingPongEaser, RepeatEaser, TypedEaser } from '.';

declare module "./typed-easer" {
    interface TypedEaser<T> {
        pingPong(): TypedEaser<T>;
        repeat(): TypedEaser<T>;
        repeat(count: number): TypedEaser<T>;
        onValue(callback: EaserValueCallback<T>): TypedEaser<T>;
        onCompleted(callback: EaserCallback): TypedEaser<T>;
    }
}

TypedEaser.prototype.pingPong = function () {
    return new PingPongEaser(this);
}

TypedEaser.prototype.repeat = function (count: number = 1) {
    return new RepeatEaser(this, count);
}

function onValue<T>(this: TypedEaser<T>, callback: EaserValueCallback<T>) {
    this.onValueChanged = callback;
    return this;
}

TypedEaser.prototype.onValue = onValue;

function onCompleted<T>(this: TypedEaser<T>, callback: EaserCallback) {
    this.onComplete = callback;
    return this;
}

TypedEaser.prototype.onCompleted = onCompleted;
