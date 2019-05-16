export class MathEx {
  static TWO_PI = 2 * Math.PI;

  static lerp(start: number, end: number, t: number) { return (end - start) * t + start; }
  static lerpc(start: number, change: number, t: number) { return change * t + start; }
}
