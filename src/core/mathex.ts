import { isNumberArray, NumberArray } from '.';

export class MathEx {
  static readonly TWO_PI = 2 * Math.PI;
  static readonly HALF_PI = Math.PI / 2;
  static readonly QUARTER_PI: number = Math.PI / 4;

  static readonly ONE_RADIAN = 180 / Math.PI;
  static readonly ONE_DEGREE = Math.PI / 180;

  static readonly SIN1 = Math.sin(MathEx.ONE_DEGREE);
  static readonly COS1 = Math.cos(MathEx.ONE_DEGREE);
  static readonly SINN1 = Math.sin(-MathEx.ONE_DEGREE);
  static readonly COSN1 = Math.cos(-MathEx.ONE_DEGREE);

  static readonly EPSILON = 0.00001;

  static toRadians(degrees: number) { return degrees * this.ONE_DEGREE; }
  static toDegrees(radians: number) {
    return radians >= 0 ? radians * this.ONE_RADIAN : radians * this.ONE_RADIAN + 360;
  }

  static toFloat(value: string) { return isNaN(+value) ? Number.NaN : parseFloat(value); }
  static toInt(value: string) { return isNaN(+value) ? Number.NaN : parseInt(value); }
  static toIntRound(value: string) { return isNaN(+value) ? Number.NaN : Math.round(this.toFloat(value)); }

  static toHex(value: number) {
    // >>> 0 forces the value to be positive.
    const result = (value >>> 0).toString(16);
    return result.length % 2 ? "0" + result : result;
  }

  static parseHex(value: string) {
    return parseInt(value, 16);
  }

  static wrapRadians(radians: number) {
    // return MathEx.wrap(radians, -Math.PI, Math.PI);

    if (radians >= -Math.PI && radians <= Math.PI)
      return radians;

    return radians - this.TWO_PI * Math.floor((radians + Math.PI) / this.TWO_PI);
  }

  static wrapDegrees(degrees: number) { return MathEx.wrap(degrees, 0, 360); }

  static lerp(start: number, end: number, t: number) { return (end - start) * t + start; }
  static lerpc(start: number, change: number, t: number) { return change * t + start; }

  static clamp(value: number, min: number, max: number) {
    if (value < min) return min;
    if (value > max) return max;
    return value;
  }

  static clampByte(value: number) { return this.clamp(value, 0, 255); }

  static wrapInt(value: number, low: number, high: number) {
    if (value >= low && value <= high)
      return value;

    value = (value - low) % (high - low + 1);
    return value < 0 ? high + value + 1 : low + value;
  }

  static wrap(value: number, low: number, high: number) {
    if (value >= low && value <= high)
      return value;

    const range = high - low;
    return value = (((value - low) % range) + range) % range + low;
  }

  static mapRange(value: number, min: number, max: number, newMin: number, newMax: number) {
    let run = max - min;

    if (run === 0) run = 1;

    const slope = (newMax - newMin) / run;
    const intercept = newMax - (slope * max);
    return value * slope + intercept;
  }

  static sign(value: number) {
    return <any>(value > 0) - <any>(value < 0) || +value;
  }

  static equals(value1: number, value2: number, epsilon: number = this.EPSILON) {
    return Math.abs(value1 - value2) <= epsilon;
  }

  static toFixed(count: number, ...values: number[]) {
    return values.map((v) => v.toFixed(count));
  }

  static random<T>(array: T[]): T;
  static random(): number;
  static random(max: number): number;
  static random(min: number, max: number): number;
  static random<T>(min?: number | T[], max?: number) {
    let array: T[] | null = null;

    if (Array.isArray(min)) {
      array = min;
      min = 0;
      max = array.length - 1;
    } else if (min === undefined) {
      min = 0;
      max = 1;
    } else if (!max) {
      max = min;
      min = 0;
    }

    return array
      ? array[Math.floor(Math.random() * (max - min + 1)) + min]
      : Math.random() * (max - min) + min;
  }

  static randomInt(max: number): number;
  static randomInt(min: number, max: number): number;
  static randomInt(min: number, max?: number) {
    if (max === undefined) {
      max = Math.floor(min);
      min = 0;
    } else {
      min = Math.ceil(min);
      max = Math.floor(max);
    }

    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  static stddev(values: NumberArray): number;
  static stddev(...values: number[]): number;
  static stddev(param1: any): number {
    const values = isNumberArray(param1) ? param1 : <number[]>Array.from(arguments);

    let sum = 0;
    const length = values.length;

    for (let i = 0; i < length; i++) {
      sum += values[i];
    }

    const mean = sum / length;
    let sqrDiff = 0;

    for (let i = 0; i < length; i++) {
      const diff = values[i] - mean;
      sqrDiff += diff * diff;
    }

    const variance = sqrDiff / length;
    return Math.sqrt(variance);
  }

  static stddevsamp(values: NumberArray): number;
  static stddevsamp(...values: number[]): number;
  static stddevsamp(param1: any): number {
    const values = isNumberArray(param1) ? param1 : <number[]>Array.from(arguments);

    let sum = 0;
    const length = values.length;

    for (let i = 0; i < length; i++) {
      sum += values[i];
    }

    const mean = sum / length;
    let sqrDiff = 0;

    for (let i = 0; i < length; i++) {
      const diff = values[i] - mean;
      sqrDiff += diff * diff;
    }

    const variance = sqrDiff / (length - 1);
    return Math.sqrt(variance);
  }

  static calcGrowth(startValue: number, growthRate: number, time: number) {
    return startValue * Math.pow(1 + growthRate, time);
  }

  static calcDecay(startValue: number, decayRate: number, time: number) {
    return startValue * Math.pow(1 - decayRate, time);
  }

  static calcGrowthTime(startValue: number, decayRate: number, targetValue: number) {
    return Math.log(startValue / targetValue) / Math.log(1 + decayRate);
  }

  static calcDecayTime(startValue: number, decayRate: number, targetValue: number) {
    return Math.log(startValue / targetValue) / Math.log(1 - decayRate);
  }
}
