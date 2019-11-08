import { Vector } from '.';
import { NumberArray } from '../core';

export interface Vector2Constructor {
  new(x: number, y: number, w?: number): Vector2;
}

export class Vector2 extends Vector {
  private static _instanceConstructor2: Vector2Constructor;
  static get instanceConstructor() { return this._instanceConstructor2; }
  static set instanceConstructor(value: Vector2Constructor) { this._instanceConstructor2 = value; }

  get magSquared() {
    if (this._magSquared !== undefined) return this._magSquared;

    let x = this.x;
    let y = this.y;
    let w = this.w;

    if (w !== 0 && w !== 1) {
      w = 1 / w;
      x *= w;
      y *= w;
    }

    const result = x * x + y * y;
    this._magSquared = result;
    return result;
  }

  get mag() {
    if (this._mag !== undefined) return this._mag;

    const w = this.w;
    let result = Math.sqrt(this.x * this.x + this.y * this.y);

    if (w !== 0 && w !== 1)
      result /= w;

    this._mag = result;
    return result;
  }

  static create(x: number, y: number, w: number = 0) { return new this.instanceConstructor(x, y, w); }
  static createPosition(x: number, y: number) { return new this.instanceConstructor(x, y, 1); }
  static createDirection(x: number, y: number) { return new this.instanceConstructor(x, y, 0); }

  writeTo(data: NumberArray, index: number) {
    data[index] = this.x;
    data[index + 1] = this.y;
    data[index + 2] = this.w;
    return index + 3;
  }

  dot(other: Vector) { return this.x * other.x + this.y * other.y; }

  distanceSquared(other: Vector) {
    const deltaX = other.x - this.x;
    const deltaY = other.y - this.y;
    return deltaX * deltaX + deltaY * deltaY;
  }

  cross2D(other: Vector) { return this.x * other.y - this.y * other.x; }
  crossO(other: Vector, result: Vector) { return result.set(this.cross2D(other), 0, 0, 0); }

  normalizeWO(result: Vector) {
    let x = this.x;
    let y = this.y;
    let w = this.w;

    if (w !== 0 && w !== 1) {
      w = 1 / w;
      x *= w;
      y *= w;
      w = 1;
    }

    return result.set(x, y, 0, w);
  }

  asCartesianO(result: Vector) {
    let x = this.x;
    let y = this.y;
    let w = this.w;

    if (w !== 0 && w !== 1) {
      w = 1 / w;
      x *= w;
      y *= w;
    }

    return result.set(x, y, 0, 1);
  }

  asPositionO(result: Vector) { return result.set(this.x, this.y, 0, 1); }

  asDirectionO(result: Vector) {
    let x = this.x;
    let y = this.y;
    let w = this.w;

    if (w !== 0 && w !== 1) {
      w = 1 / w;
      x *= w;
      y *= w;
    }

    return result.set(x, y, 0, 0);
  }

  displaceByO(other: Vector, result: Vector) {
    let ox = other.x;
    let oy = other.y;
    let ow = other.w;

    if (ow !== 0 && ow !== 1) {
      ow = 1 / ow;
      ox *= ow;
      oy *= ow;
    }

    let x = this.x;
    let y = this.y;
    let w = this.w;

    if (w !== 0 && w !== 1) {
      ox *= w;
      oy *= w;
    }

    return result.set(x + ox, y + oy, 0, w);
  }

  displaceByScaledO(other: Vector, scale: number, result: Vector) {
    let ox = other.x * scale;
    let oy = other.y * scale;
    let ow = other.w;

    if (ow !== 0 && ow !== 1) {
      ow = 1 / ow;
      ox *= ow;
      oy *= ow;
    }

    let x = this.x;
    let y = this.y;
    let w = this.w;

    if (w !== 0 && w !== 1) {
      ox *= w;
      oy *= w;
    }

    return result.set(x + ox, y + oy, 0, w);
  }

  addO(other: Vector, result: Vector) { return result.set(this.x + other.x, this.y + other.y, 0, this.w + other.w); }
  subO(other: Vector, result: Vector) { return result.set(this.x - other.x, this.y - other.y, 0, this.w - other.w); }
  scaleO(scale: number, result: Vector) { return result.set(this.x * scale, this.y * scale, 0, this.w); }

  addScaledO(other: Vector, scale: number, result: Vector) {
    return result.set(this.x + other.x * scale, this.y + other.y * scale, 0, this.w + other.w);
  }

  normalizeScaleO(scale: number, result: Vector) {
    let x = this.x;
    let y = this.y;
    let w = this.w;

    if (w !== 0 && w !== 1) {
      w = 1 / w;
      x *= w;
      y *= w;
      w = 1;
    }

    const magInv = 1 / this.mag;
    return result.set(x * magInv * scale, y * magInv * scale, 0, w);
  }

  multO(other: Vector, result: Vector): Vector;
  multO(scaleX: number, result: Vector): Vector;
  multO(scaleX: number, scaleY: number, result: Vector): Vector;
  multO(scaleX: number, scaleY: number, scaleZ: number, result: Vector): Vector;
  multO(param1: Vector | number, param2?: any, param3?: any, param4?: Vector): Vector {
    let scaleX: number;
    let scaleY: number;
    let result: Vector;

    if (param1 instanceof Vector) {
      scaleX = param1.x;
      scaleY = param1.y;
      result = param2;
    } else if (arguments.length === 2) {
      scaleX = param1;
      scaleY = 1;
      result = param3!;
    } else if (arguments.length === 3) {
      scaleX = param1;
      scaleY = param2;
      result = param3!;
    } else {
      scaleX = param1;
      scaleY = param2;
      result = param4!;
    }

    return result.set(this.x * scaleX, this.y * scaleY, 0, this.w);
  }

  divO(scale: number, result: Vector) {
    scale = 1 / scale;
    return result.set(this.x * scale, this.y * scale, 0, this.w);
  }

  negateO(result: Vector) { return result.set(-this.x, -this.y, 0, this.w); }

  normalizeO(result: Vector) {
    let x = this.x;
    let y = this.y;
    let w = this.w;

    if (w !== 0 && w !== 1) {
      w = 1 / w;
      x *= w;
      y *= w;
      w = 1;
    }

    const magInv = 1 / this.mag;
    return result.set(x * magInv, y * magInv, 0, w);
  }

  perpLeftO(result: Vector) { return result.set(-this.y, this.x, 0, this.w); }
  perpRightO(result: Vector) { return result.set(this.y, -this.x, 0, this.w); }

  toPixelsO(result: Vector, pixelsPerMeter: number = Vector.pixelsPerMeter) {
    return result.set(this.x * pixelsPerMeter, this.y * pixelsPerMeter, 0, this.w);
  }

  toMetersO(result: Vector, pixelsPerMeter: number = Vector.pixelsPerMeter) {
    const inverse = 1 / pixelsPerMeter;
    return result.set(this.x * inverse, this.y * inverse, 0, this.w);
  }

  equals(other: Vector, epsilon: number = Number.EPSILON) {
    if (this.isDirection && other.isDirection)
      return Math.abs(this.x - other.x) < epsilon && Math.abs(this.y - other.y) < epsilon;

    if (this.w === 1 && other.w === 1)
      return Math.abs(this.x - other.x) < epsilon && Math.abs(this.y - other.y) < epsilon;

    if (this.isDirection || other.isDirection)
      return false;

    if (this.w !== 1)
      return Math.abs(this.x / this.w - other.x) < epsilon && Math.abs(this.y / this.w - other.y) < epsilon;

    return Math.abs(this.x - other.x / other.w) < epsilon && Math.abs(this.y - other.y / other.w) < epsilon;
  }

  toString(precision: number = 2) {
    return this.isPosition
      ? `[${this.x.toFixed(precision)}, ${this.y.toFixed(precision)}, ${this.w.toFixed(precision)}]`
      : `<${this.x.toFixed(precision)}, ${this.y.toFixed(precision)}, ${this.w.toFixed(precision)}>`;
  }
}
