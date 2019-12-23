import { Vector } from '../vectors';

export class RotMat2D {
  constructor(radians: number);
  constructor(a: number, b: number, c: number, d: number);
  constructor(aOrRadians: number, b?: number, c?: number, d?: number) {
    if (arguments.length === 1) {
      const c = Math.cos(aOrRadians);
      const s = Math.sin(aOrRadians);
      this._m00 = c;
      this._m01 = -s;
      this._m10 = s;
      this._m11 = c;
    } else {
      this._m00 = aOrRadians;
      this._m01 = b!;
      this._m10 = c!;
      this._m11 = d!;
    }
  }

  protected _m00: number;
  get m00() { return this._m00; }
  protected _m01: number;
  get m01() { return this._m01; }
  protected _m10: number;
  get m10() { return this._m10; }
  protected _m11: number;
  get m11() { return this._m11; }

  setAngle(radians: number) {
    const c = Math.cos(radians);
    const s = Math.sin(radians);
    this._m00 = c;
    this._m01 = -s;
    this._m10 = s;
    this._m11 = c;
  }

  transpose() { return new RotMat2D(this._m00, this._m10, this._m01, this._m11); }

  transform(v: Vector, position: Vector, result?: Vector) {
    const w = position.w;
    const x = position.x * w;
    const y = position.y * w;

    if (result) {
      return result.withXYW(
        this._m00 * v.x + this._m01 * v.y + x,
        this._m10 * v.x + this._m11 * v.y + y,
        v.w);
    }

    return Vector.create(
      this._m00 * v.x + this._m01 * v.y + x,
      this._m10 * v.x + this._m11 * v.y + y,
      v.w);
  }

  transformInverse(v: Vector, position: Vector, result?: Vector) {
    const w = position.w;
    const x = -position.x * w;
    const y = -position.y * w;

    if (result) {
      return result.withXYW(
        this._m00 * v.x + this._m10 * v.y + x,
        this._m01 * v.x + this._m11 * v.y + y,
        v.w);
    }

    return Vector.create(
      this._m00 * v.x + this._m10 * v.y + x,
      this._m01 * v.x + this._m11 * v.y + y,
      v.w);
  }

  mult(other: RotMat2D) {
    return new RotMat2D(
      this._m00 * other._m00 + this._m01 * other._m10,
      this._m00 * other._m01 + this._m01 * other._m11,
      this._m10 * other._m00 + this._m11 * other._m10,
      this._m10 * other._m01 + this._m11 * other._m11);
  }

  setTransform(ctx: CanvasRenderingContext2D, position: Vector) {
    const { x, y } = position;
    ctx.setTransform(this._m00, this._m10, this._m01, this._m11, x, y);
  }

  updateTransform(ctx: CanvasRenderingContext2D, position: Vector) {
    const { x, y } = position;
    ctx.transform(this._m00, this._m10, this._m01, this._m11, x, y);
  }
}
