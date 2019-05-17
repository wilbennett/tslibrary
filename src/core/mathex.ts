export class MathEx {
  static readonly TWO_PI = 2 * Math.PI;
  static readonly HALF_PI = Math.PI / 2;

  static readonly ONE_RADIAN = 180 / Math.PI;
  static readonly ONE_DEGREE = Math.PI / 180;

  static readonly SIN1 = Math.sin(MathEx.ONE_DEGREE);
  static readonly COS1 = Math.cos(MathEx.ONE_DEGREE);
  static readonly SINN1 = Math.sin(-MathEx.ONE_DEGREE);
  static readonly COSN1 = Math.cos(-MathEx.ONE_DEGREE);


  static lerp(start: number, end: number, t: number) { return (end - start) * t + start; }
  static lerpc(start: number, change: number, t: number) { return change * t + start; }
}
