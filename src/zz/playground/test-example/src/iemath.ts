import { MathEx } from '../../../../core';
import { Brush } from '../../../../twod';
import { dir } from '../../../../vectors';

const colors: Brush[] = [
  "red",
  "orange",
  // "yellow",
  "green",
  "blue",
  "indigo",
  "violet",
];

export class IEMath {
  static readonly gravityScale = 5;
  static readonly gravity = dir(0, 10 * IEMath.gravityScale);
  static readonly dt = 1 / 60;

  static sqr(n: number) { return n * n; }
  static biasGreaterThan(a: number, b: number) {
    const biasRelative = 0.95;
    const biasAbsolute = 0.01;
    return a >= b * biasRelative + a * biasAbsolute;
  }

  static randomBrush() { return MathEx.random(colors); }
}
