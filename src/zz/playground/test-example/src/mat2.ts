import { Vec2 } from '.';

export class Mat2 {
  constructor(radians: number);
  constructor(a: number, b: number, c: number, d: number);
  constructor(aOrRadians: number, b?: number, c?: number, d?: number) {
    if (arguments.length === 1) {
      const c = Math.cos(aOrRadians);
      const s = Math.sin(aOrRadians);
      this.v = [c, -s, s, c];
    } else {
      this.v = [aOrRadians, b!, c!, d!];
    }
  }

  v: number[];
  get m00() { return this.v[0]; }
  set m00(value) { this.v[0] = value; }
  get m01() { return this.v[1]; }
  set m01(value) { this.v[1] = value; }
  get m10() { return this.v[2]; }
  set m10(value) { this.v[2] = value; }
  get m11() { return this.v[3]; }
  set m11(value) { this.v[3] = value; }

  set(radians: number) {
    const c = Math.cos(radians);
    const s = Math.sin(radians);
    this.v = [c, -s, s, c];
  }

  abs() { const v = this.v; return new Mat2(Math.abs(v[0]), Math.abs(v[1]), Math.abs(v[2]), Math.abs(v[3])); }
  axisX() { return new Vec2(this.m00, this.m10); }
  axisY() { return new Vec2(this.m01, this.m11); }
  transpose() { return new Mat2(this.m00, this.m10, this.m01, this.m11); }
  multVec(v: Vec2) { return new Vec2(this.m00 * v.x + this.m01 * v.y, this.m10 * v.x + this.m11 * v.y); }

  mult(rhs: Mat2) {
    return new Mat2(
      this.m00 * rhs.m00 + this.m01 * rhs.m10,
      this.m00 * rhs.m01 + this.m01 * rhs.m11,
      this.m10 * rhs.m00 + this.m11 * rhs.m10,
      this.m10 * rhs.m01 + this.m11 * rhs.m11);
  }
}
