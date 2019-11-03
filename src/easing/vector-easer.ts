import { EaseFunction, EaserCallback, EaserValueCallback, NumberEaser, ValueEaser } from '.';
import { Vector } from '../vectors';

export class VectorEaser extends ValueEaser<Vector> {
  protected _result: Vector;
  protected _easeX: NumberEaser;
  protected _easeY: NumberEaser;
  protected _easeZ: NumberEaser;

  constructor(
    start: Vector,
    end: Vector,
    duration: number,
    ease: EaseFunction,
    onValueChanged?: EaserValueCallback<Vector>,
    onComplete?: EaserCallback
  ) {
    super(start, end, duration, ease, onValueChanged, onComplete);

    this._easeX = new NumberEaser(start.x, end.x, duration, ease);
    this._easeY = new NumberEaser(start.y, end.y, duration, ease);
    this._easeZ = new NumberEaser(start.z, end.z, duration, ease);
    this._result = start.clone();
    this.init();
  }

  reset() {
    super.reset();
    this._easeX.reset();
    this._easeY.reset();
    this._easeZ.reset();
  }

  reverse() {
    super.reverse();
    this._easeX.reverse();
    this._easeY.reverse();
    this._easeZ.reverse();
  }

  // @ts-ignore - unused param.
  protected calcValue(percent: number): Vector {
    this._easeX.moveNext();
    this._easeY.moveNext();
    this._easeZ.moveNext();
    this._result.withXYZ(this._easeX.value, this._easeY.value, this._easeZ.value);
    return this._result;
  }
}