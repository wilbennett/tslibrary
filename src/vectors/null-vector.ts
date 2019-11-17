import { Vector } from '.';

export class NullVector extends Vector {
  get isEmpty() { return true; }

  // @ts-ignore - unused param.
  protected newVector(x: number = 0, y: number = 0, z: number = 0, w: number = 0) { return this; }
  // @ts-ignore - unused param.
  set(x: number, y: number, z: number, w: number = 0): Vector { return this; }

  // @ts-ignore - unused param.
  dot(other: Vector) { return 0; }
  // @ts-ignore - unused param.
  distanceSquared(other: Vector) { return 0; }
  // @ts-ignore - unused param.
  cross2D(other: Vector) { return 0; }
  // @ts-ignore - unused param.
  crossO(other: Vector, result?: Vector) { return this.zeroResult(result); }
  // @ts-ignore - unused param.
  cross(other: Vector) { return this; }
  normalizeWO(result?: Vector) { return this.zeroResult(result); }
  normalizeW() { return this; }
  asCartesianO(result?: Vector) { return this.zeroResult(result); }
  asCartesian() { return this; }
  asPositionO(result?: Vector) { return this.zeroResult(result); }
  asPosition() { return this; }
  asDirectionO(result?: Vector) { return this.zeroResult(result); }
  asDirection() { return this; }
  asCartesianPositionO(result?: Vector) { return this.zeroResult(result); }
  asCartesianPosition() { return this; }
  asCartesianDirectionO(result?: Vector) { return this.zeroResult(result); }
  asCartesianDirection() { return this; }
  // @ts-ignore - unused param.
  displaceByO(other: Vector, result?: Vector) { return this.zeroResult(result); }
  // @ts-ignore - unused param.
  displaceBy(other: Vector) { return this; }
  // @ts-ignore - unused param.
  displaceByNegO(other: Vector, result?: Vector) { return this.zeroResult(result); }
  // @ts-ignore - unused param.
  displaceByNeg(other: Vector) { return this; }
  // @ts-ignore - unused param.
  displaceByScaledO(other: Vector, scale: number, result?: Vector) { return this.zeroResult(result); }
  // @ts-ignore - unused param.
  displaceByScaled(other: Vector, scale: number) { return this; }
  // @ts-ignore - unused param.
  displaceByNegScaledO(other: Vector, scale: number, result?: Vector) { return this.zeroResult(result); }
  // @ts-ignore - unused param.
  displaceByNegScaled(other: Vector, scale: number) { return this; }
  // @ts-ignore - unused param.
  addO(other: Vector, result?: Vector) { return this.zeroResult(result); }
  // @ts-ignore - unused param.
  add(other: Vector) { return this; }
  // @ts-ignore - unused param.
  subO(other: Vector, result?: Vector) { return this.zeroResult(result); }
  // @ts-ignore - unused param.
  sub(other: Vector) { return this; }
  // @ts-ignore - unused param.
  scaleO(scale: number, result?: Vector) { return this.zeroResult(result); }
  // @ts-ignore - unused param.
  scale(scale: number) { return this; }
  // @ts-ignore - unused param.
  addScaledO(other: Vector, scale: number, result?: Vector) { return this.zeroResult(result); }
  // @ts-ignore - unused param.
  addScaled(other: Vector, scale: number) { return this; }
  // @ts-ignore - unused param.
  normalizeScaleO(scale: number, result?: Vector) { return this.zeroResult(result); }
  // @ts-ignore - unused param.
  normalizeScale(scale: number) { return this; }

  multO(other: Vector, result?: Vector): Vector;
  multO(scaleX: number, result?: Vector): Vector;
  multO(scaleX: number, scaleY: number, result?: Vector): Vector;
  multO(scaleX: number, scaleY: number, scaleZ: number, result?: Vector): Vector;
  multO(param1: Vector | number, param2?: any, param3?: any, param4?: Vector): Vector {
    let result: Vector | undefined;

    if (param1 instanceof Vector) {
      result = param2;
    } else if (arguments.length === 2) {
      result = param3;
    } else if (arguments.length === 3) {
      result = param3;
    } else {
      result = param4;
    }

    return this.zeroResult(result);
  }

  mult(other: Vector): Vector;
  mult(scaleX: number): Vector;
  mult(scaleX: number, scaleY: number): Vector;
  mult(scaleX: number, scaleY: number, scaleZ: number): Vector;
  // @ts-ignore - unused param.
  mult(param1: Vector | number, param2?: any, param3?: any): Vector {
    return this;
  }

  // @ts-ignore - unused param.
  divO(scale: number, result?: Vector) { return this.zeroResult(result); }
  // @ts-ignore - unused param.
  div(scale: number) { return this; }
  negateO(result?: Vector) { return this.zeroResult(result); }
  negate() { return this; }
  normalizeO(result?: Vector) { return this.zeroResult(result); }
  normalize() { return this; }
  // @ts-ignore - unused param.
  rotateO(radians: number, result?: Vector) { return this.zeroResult(result); }
  // @ts-ignore - unused param.
  rotate(radians: number) { return this; }
  // @ts-ignore - unused param.
  rotateAboutO(center: Vector, radians: number, result?: Vector) { return this.zeroResult(result); }
  // @ts-ignore - unused param.
  rotateAbout(center: Vector, radians: number) { return this; }
  rotateOneDegreeO(result?: Vector) { return this.zeroResult(result); }
  rotateOneDegree() { return this; }
  rotateNegativeOneDegreeO(result?: Vector) { return this.zeroResult(result); }
  rotateNegativeOneDegree() { return this; }
  perpLeftO(result?: Vector) { return this.zeroResult(result); }
  perpLeft() { return this; }
  perpRightO(result?: Vector) { return this.zeroResult(result); }
  perpRight() { return this; }
  // @ts-ignore - unused param.
  projectOntoUnitO(unitVector: Vector, result?: Vector) { return this.zeroResult(result); }
  // @ts-ignore - unused param.
  projectOntoUnit(unitVector: Vector) { return this; }
  // @ts-ignore - unused param.
  projectOntoO(other: Vector, result?: Vector) { return this.zeroResult(result); }
  // @ts-ignore - unused param.
  projectOnto(other: Vector) { return this; }
  // @ts-ignore - unused param.
  reflectViaNormalO(normal: Vector, result?: Vector) { return this.zeroResult(result); }
  // @ts-ignore - unused param.
  reflectViaNormal(normal: Vector) { return this; }
  // @ts-ignore - unused param.
  reflectOffO(reflector: Vector, result?: Vector): Vector { return this.zeroResult(result); }
  // @ts-ignore - unused param.
  reflectOff(reflector: Vector): Vector { return this; }
  // @ts-ignore - unused param.
  reflectO(source: Vector, result?: Vector): Vector { return this.zeroResult(result); }
  // @ts-ignore - unused param.
  reflect(source: Vector): Vector { return this; }
  // @ts-ignore - unused param.
  clampO(min: Vector, max: Vector, result?: Vector) { return this.zeroResult(result); }
  // @ts-ignore - unused param.
  clamp(min: Vector, max: Vector) { return this; }
  // @ts-ignore - unused param.
  clampMinO(min: Vector, result?: Vector) { return this.zeroResult(result); }
  // @ts-ignore - unused param.
  clampMin(min: Vector) { return this; }
  // @ts-ignore - unused param.
  clampMaxO(max: Vector, result?: Vector) { return this.zeroResult(result); }
  // @ts-ignore - unused param.
  clampMax(max: Vector) { return this; }
  // @ts-ignore - unused param.
  toPixelsO(result?: Vector, pixelsPerMeter: number = Vector.pixelsPerMeter) { return this.zeroResult(result); }
  // @ts-ignore - unused param.
  toPixels(pixelsPerMeter: number = Vector.pixelsPerMeter) { return this; }
  // @ts-ignore - unused param.
  toMetersO(result?: Vector, pixelsPerMeter: number = Vector.pixelsPerMeter) { return this.zeroResult(result); }
  // @ts-ignore - unused param.
  toMeters(pixelsPerMeter: number = Vector.pixelsPerMeter) { return this; }
  // @ts-ignore - unused param.
  withXYZWO(x: number, y: number, z: number, w: number, result?: Vector) { return this.zeroResult(result); }
  // @ts-ignore - unused param.
  withXYZW(x: number, y: number, z: number, w: number) { return this; }
  // @ts-ignore - unused param.
  withXYZO(x: number, y: number, z: number, result?: Vector) { return this.zeroResult(result); }
  // @ts-ignore - unused param.
  withXYZ(x: number, y: number, z: number) { return this; }
  // @ts-ignore - unused param.
  withXYWO(x: number, y: number, w: number, result?: Vector) { return this.zeroResult(result); }
  // @ts-ignore - unused param.
  withXYW(x: number, y: number, w: number) { return this; }
  // @ts-ignore - unused param.
  withXYO(x: number, y: number, result?: Vector) { return this.zeroResult(result); }
  // @ts-ignore - unused param.
  withXY(x: number, y: number) { return this; }
  // @ts-ignore - unused param.
  withXO(x: number, result?: Vector) { return this.zeroResult(result); }
  // @ts-ignore - unused param.
  withX(x: number) { return this; }
  // @ts-ignore - unused param.
  withYO(y: number, result?: Vector) { return this.zeroResult(result); }
  // @ts-ignore - unused param.
  withY(y: number) { return this; }
  // @ts-ignore - unused param.
  withZO(z: number, result?: Vector) { return this.zeroResult(result); }
  // @ts-ignore - unused param.
  withZ(z: number) { return this; }
  // @ts-ignore - unused param.
  withWO(w: number, result?: Vector) { return this.zeroResult(result); }
  // @ts-ignore - unused param.
  withW(w: number) { return this; }
  // @ts-ignore - unused param.
  withNegXO(result?: Vector) { return this.zeroResult(result); }
  withNegX() { return this; }
  // @ts-ignore - unused param.
  withNegYO(result?: Vector) { return this.zeroResult(result); }
  withNegY() { return this; }
  // @ts-ignore - unused param.
  withNegZO(result?: Vector) { return this.zeroResult(result); }
  withNegZ() { return this; }
  // @ts-ignore - unused param.
  withRadiansO(radians: number, result?: Vector) { return this.zeroResult(result); }
  // @ts-ignore - unused param.
  withRadians(radians: number) { return this; }
  // @ts-ignore - unused param.
  withDegreesO(degrees: number, result?: Vector) { return this.zeroResult(result); }
  // @ts-ignore - unused param.
  withDegrees(degrees: number) { return this; }
  // @ts-ignore - unused param.
  withRadiansMagO(radians: number, mag: number, result?: Vector) { return this; }
  withRadiansMag(radians: number, mag: number) { return this.withRadiansMagO(radians, mag, this); }
  // @ts-ignore - unused param.
  withDegreesMagO(degrees: number, mag: number, result?: Vector) { return this.zeroResult(result); }
  // @ts-ignore - unused param.
  withDegreesMag(degrees: number, mag: number) { return this; }
  // @ts-ignore - unused param.
  withMagO(mag: number, result?: Vector) { return this.zeroResult(result); }
  // @ts-ignore - unused param.
  withMag(scale: number) { return this; }
  // @ts-ignore - unused param.
  equals(other: Vector, epsilon: number = Number.EPSILON) { return other instanceof NullVector; }

  toString(precision: number = 2) {
    return `[${this.x.toFixed(precision)}, ${this.y.toFixed(precision)}, ${this.w.toFixed(precision)}]`;
  }

  private zeroResult(result?: Vector): Vector {
    result || (result = this.newVector());
    return result.set(0, 0, 0, 0);
  }
}
