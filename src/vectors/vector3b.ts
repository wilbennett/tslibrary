import { Vector3, Vector3D, VectorDataXYZW } from '.';
import { NumberArray } from '../core';

export class Vector3B extends Vector3 {
  protected _values: NumberArray;
  protected _startIndex: number;

  constructor();
  constructor(data: VectorDataXYZW, index: number);
  constructor(x: number, data: VectorDataXYZW, index: number);
  constructor(x: number, y: number, data: VectorDataXYZW, index: number);
  constructor(x: number, y: number, w: number, data: VectorDataXYZW, index: number);
  constructor(x: number, y: number, z: number, w: number, data: VectorDataXYZW, index: number);
  constructor(param1?: any, param2?: any, param3?: any, param4?: any, param5?: any, param6?: any) {
    super();
    let x = 0;
    let y = 0;
    let z = 0;
    let w = 0;
    let data: VectorDataXYZW;
    let index = 0;

    switch (arguments.length) {
      case 0:
        data = new VectorDataXYZW(1);
        break;
      case 2:
        data = param1;
        index = param2;
        break;
      case 3:
        x = param1!;
        data = param2;
        index = param3;
        break;
      case 4:
        x = param1!;
        y = param2;
        data = param3;
        index = param4;
        break;
      case 5:
        x = param1!;
        y = param2;
        z = param3;
        data = param4;
        index = param5;
        break;
      default:
        x = param1!;
        y = param2;
        z = param3;
        w = param4;
        data = param5;
        index = param6;
        break;
    }

    this._values = data.values;
    this._startIndex = data.getStartIndex(index);
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
  }

  static get [Symbol.species]() { return Vector3D; }
  static get elementCount() { return 4; }
  get elementCount() { return Vector3B.elementCount; }
  get x() { return this._values[this._startIndex]; }
  set x(value) { this._values[this._startIndex] = value; }
  get y() { return this._values[this._startIndex + 1]; }
  set y(value) { this._values[this._startIndex + 1] = value; }
  get z() { return this._values[this._startIndex + 2]; }
  set z(value) { this._values[this._startIndex + 2] = value; }
  get w() { return this._values[this._startIndex + 3]; }
  set w(value) { this._values[this._startIndex + 3] = value; }
  private __magSquared?: number;
  protected get _magSquared(): number | undefined { return this.__magSquared; }
  protected set _magSquared(value) { this.__magSquared = value; }
  private __mag?: number;
  protected get _mag(): number | undefined { return this.__mag; }
  protected set _mag(value) { this.__mag = value; }
}
