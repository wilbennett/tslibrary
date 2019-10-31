import { Vector1, Vector1D, VectorDataX } from '.';
import { NumberArray } from '../core';

export class Vector1B extends Vector1 {
  protected _values: NumberArray;
  protected _startIndex: number;

  constructor();
  constructor(data: VectorDataX, index: number);
  constructor(x: number, data: VectorDataX, index: number);
  constructor(param1?: any, param2?: any, param3?: any) {
    super();
    let x = 0;
    let data: VectorDataX;
    let index = 0;

    switch (arguments.length) {
      case 0:
        data = new VectorDataX(1);
        break;
      case 2:
        data = param1;
        index = param2;
        break;
      default:
        x = param1!;
        data = param2;
        index = param3;
        break;
    }

    this._values = data.values;
    this._startIndex = data.getStartIndex(index);
    this.x = x;
  }

  static get [Symbol.species]() { return Vector1D; }
  static get elementCount() { return 1; }
  get elementCount() { return Vector1B.elementCount; }
  get x() { return this._values[this._startIndex]; }
  set x(value) { this._values[this._startIndex] = value; }
}
