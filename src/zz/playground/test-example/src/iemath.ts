import { MathEx } from '../../../../core';
import { Brush } from '../../../../twod';
import { dir, Vector } from '../../../../vectors';

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
  static readonly dt = 1 / 60;
  private static _gravity: Vector;
  static get gravity() { return this._gravity; }
  private static _gravityStrength: number;
  static get gravityStrength() { return this._gravityStrength; }
  static set gravityStrength(value) {
    this._gravityStrength = value;
    this._gravity = dir(0, -this._gravityStrength * IEMath.gravityScale);
  }

  static sqr(n: number) { return n * n; }
  static biasGreaterThan(a: number, b: number) {
    const biasRelative = 0.95;
    const biasAbsolute = 0.01;
    return a >= b * biasRelative + a * biasAbsolute;
  }

  static randomBrush() { return MathEx.random(colors); }
}

IEMath.gravityStrength = 10;
