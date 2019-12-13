import { MathEx } from '../../../../core';

export class Vec2 {
  constructor(x: number = 0, y: number = 0) {
    this.x = x;
    this.y = y;
  }

  x: number;
  y: number;
  get lenSqr() { return this.x * this.x + this.y * this.y; }
  get len() { return Math.sqrt(this.x * this.x + this.y * this.y); }

  set(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  clone() { return new Vec2(this.x, this.y); }
  negate() { return new Vec2(-this.x, -this.y); }
  scale(s: number) { this.x *= s; this.y *= s; }
  scaleO(s: number) { return new Vec2(this.x * s, this.y * s); }
  div(s: number) { return new Vec2(this.x / s, this.y / s); }
  adds(s: number) { return new Vec2(this.x + s, this.y + s); }
  add(v: Vec2) { this.x += v.x; this.y += v.y; }
  addO(v: Vec2) { return new Vec2(this.x + v.x, this.y + v.y); }
  sub(v: Vec2) { this.x -= v.x; this.y -= v.y; }
  subO(v: Vec2) { return new Vec2(this.x - v.x, this.y - v.y); }

  rotate(radians: number) {
    const c = Math.cos(radians);
    const s = Math.sin(radians);

    const xp = this.x * c - this.y * s;
    const yp = this.x * s + this.y * c;

    this.x = xp;
    this.y = yp;
  }

  normalize() {
    const len = this.len;

    if (len > MathEx.epsilon) {
      const inv = 1 / len;
      this.x *= inv;
      this.y *= inv;
    }
  }

  min(v: Vec2) { return new Vec2(Math.min(this.x, v.x), Math.min(this.y, v.y)); }
  max(v: Vec2) { return new Vec2(Math.max(this.x, v.x), Math.max(this.y, v.y)); }
  dot(v: Vec2) { return this.x * v.x + this.y * v.y; }

  distSqr(v: Vec2) {
    const c = this.subO(v);
    return c.dot(c);
  }

  crossS(s: number) { return new Vec2(s * this.y, -s * this.x); }
  sCross(s: number) { return new Vec2(-s * this.y, s * this.x); }
  cross(v: Vec2) { return this.x * v.y - this.y * v.x; }
}
