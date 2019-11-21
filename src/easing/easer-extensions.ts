import { EaserCallback, EaserValueCallback, PingPongEaser, RepeatEaser, TypedEaser, Easer, EaserAdapter } from '.';

declare module "./easer" {
    interface Easer {
        pingPong(): Easer;
        repeat(): Easer;
        repeat(count: number): Easer;
        onCompleted(callback: EaserCallback): Easer;
    }
}

declare module "./typed-easer" {
    interface TypedEaser<T> {
        pingPong(): TypedEaser<T>;
        repeat(): TypedEaser<T>;
        repeat(count: number): TypedEaser<T>;
        onValue(callback: EaserValueCallback<T>): TypedEaser<T>;
        onCompleted(callback: EaserCallback): TypedEaser<T>;
    }
}

Easer.prototype.pingPong = function () {
  return new PingPongEaser(new EaserAdapter(this));
}

Easer.prototype.repeat = function (count: number = 1) {
  return new RepeatEaser(new EaserAdapter(this), count);
}

function onCompleted(this: Easer, callback: EaserCallback) {
  this.onComplete = callback;
  return this;
}

Easer.prototype.onCompleted = onCompleted;

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

function onCompletedT<T>(this: TypedEaser<T>, callback: EaserCallback) {
    this.onComplete = callback;
    return this;
}

TypedEaser.prototype.onCompleted = onCompletedT;
