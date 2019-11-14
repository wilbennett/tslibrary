import { NullVector } from '.';
import { MathEx, NumberArray } from '../core';
import { ContextProps, Viewport } from '../twod';

export interface VectorConstructor {
  new(x: number, y: number, z: number, w: number): Vector;
}

export abstract class Vector {
  private static _instanceConstructor: VectorConstructor;
  static get instanceConstructor() { return this._instanceConstructor; }
  static set instanceConstructor(value: VectorConstructor) { this._instanceConstructor = value; }

  static tipDrawHeight = 5;
  static get elementCount() { return 4; }
  get elementCount() { return Vector.elementCount; }
  get x() { return 0; }
  // @ts-ignore - unused params.
  set x(value) { }
  get y() { return 0; }
  // @ts-ignore - unused params.
  set y(value) { }
  get z() { return 0; }
  // @ts-ignore - unused params.
  set z(value) { }
  get w() { return 0; }
  // @ts-ignore - unused params.
  set w(value) { }
  get r() { return this.x; }
  set r(value) { this.x = value; }
  get g() { return this.y; }
  set g(value) { this.y = value; }
  get b() { return this.z; }
  set b(value) { this.z = value; }
  get a() { return this.w; }
  set a(value) { this.w = value; }
  get minElement() { return Math.min(this.x, this.y, this.z); }
  get maxElement() { return Math.max(this.x, this.y, this.z); }
  get isPosition() { return this.w !== 0; }
  get isDirection() { return this.w === 0; }
  get isEmpty() { return false; }
  protected get _magSquared(): number | undefined { return undefined; }
  // @ts-ignore - unused params.
  protected set _magSquared(value) { }
  protected get _mag(): number | undefined { return undefined; }
  // @ts-ignore - unused params.
  protected set _mag(value) { }
  protected get _radians(): number | undefined { return undefined; }
  // @ts-ignore - unused params.
  protected set _radians(value) { }

  static create(x: number, y: number, z: number = 0, w: number = 0) {
    return new this.instanceConstructor(x, y, z || 0, w);
  }

  static createPosition(x: number, y: number, z: number = 0) {
    return new this.instanceConstructor(x, y, z || 0, 1);
  }

  static createDirection(x: number, y: number, z: number = 0) {
    return new this.instanceConstructor(x, y, z || 0, 0);
  }

  getCoord(index: number) {
    switch (index) {
      case 0: return this.x;
      case 1: return this.y;
      case 2: return this.z;
      default: return this.w;
    }
  }

  setCoord(index: number, value: number) {
    switch (index) {
      case 0: this.x = value; break;
      case 1: this.y = value; break;
      case 2: this.z = value; break;
      default: this.w = value; break;
    }
  }

  get magSquared() {
    if (this._magSquared !== undefined) return this._magSquared;

    let x = this.x;
    let y = this.y;
    let z = this.z;
    let w = this.w;

    if (w !== 0 && w !== 1) {
      w = 1 / w;
      x *= w;
      y *= w;
      z *= w;
    }

    const result = x * x + y * y + z * z;
    this._magSquared = result;
    return result;
  }

  get mag() {
    if (this._mag !== undefined) return this._mag;

    const w = this.w;
    let result = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);

    if (w !== 0 && w !== 1)
      result /= w;

    this._mag = result;
    return result;
  }

  get normal() { return this.perp(); }

  // TODO: Proper 3D implementation.
  get radians() {
    if (this._radians !== undefined) return this._radians;

    let result = Math.atan2(this.y, this.x);
    result = result >= 0 ? result : result + MathEx.TWO_PI;
    this._radians = result;
    return result;
  }

  get degrees() { return this.radians * MathEx.ONE_RADIAN; }

  static pixelsPerMeter = 30;
  private static _empty: Vector;
  static get empty() { return Vector._empty || (Vector._empty = new NullVector()); }
  static get [Symbol.species]() { return this; }

  protected newVector(x: number = 0, y: number = 0, z: number = 0, w: number = 0): Vector {
    // @ts-ignore - species pattern.
    const Species = this.constructor[Symbol.species];
    return new Species(x, y, z, w);
  }

  // TODO: Allow copying cached properties.
  set(x: number, y: number, z: number, w: number = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
    return this.clear(this);
  }

  copyFrom(other: Vector) { return this.set(other.x, other.y, other.z, other.w); }
  copyTo(other: Vector) { other.set(this.x, this.y, this.z, this.w); return this; }

  writeTo(data: NumberArray, index: number) {
    data[index] = this.x;
    data[index + 1] = this.y;
    data[index + 2] = this.z;
    data[index + 3] = this.w;
    return index + 4;
  }

  clone(result?: Vector) {
    return result
      ? result.copyFrom(this)
      : this.newVector(this.x, this.y, this.z, this.w);
  }

  dot(other: Vector) { return this.x * other.x + this.y * other.y + this.z * other.z; }

  distanceSquared(other: Vector) {
    const deltaX = other.x - this.x;
    const deltaY = other.y - this.y;
    const deltaZ = other.z - this.z;
    return deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ;
  }

  distance(other: Vector) { return Math.sqrt(this.distanceSquared(other)); }

  cross2D(other: Vector) { return this.x * other.y - this.y * other.x; }

  crossO(other: Vector, result?: Vector) {
    result || (result = this.newVector());

    return result.set(
      this.y * other.z - this.z * other.y,
      this.z * other.x - this.x * other.z,
      this.x * other.y - this.y * other.x,
      0);
  }
  crossN(other: Vector) { return this.crossO(other, this.newVector()); }
  cross(other: Vector) { return this.crossO(other, this); }

  // TODO: Doesn't change angle. Should not change cached angle.
  normalizeWO(result?: Vector) {
    let x = this.x;
    let y = this.y;
    let z = this.z;
    let w = this.w;

    if (w !== 0 && w !== 1) {
      w = 1 / w;
      x *= w;
      y *= w;
      z *= w;
      w = 1;
    }

    result || (result = this.newVector());
    return result.set(x, y, z, w);
  }
  normalizeWN() { return this.normalizeWO(this.newVector()); }
  normalizeW() { return this.normalizeWO(this); }

  asCartesianO(result?: Vector) { return this.normalizeWO(result); }
  asCartesianN() { return this.asCartesianO(this.newVector()); }
  asCartesian() { return this.asCartesianO(this); }

  asPositionO(result?: Vector) {
    result || (result = this.newVector());
    return result.set(this.x, this.y, this.z, 1);
  }
  asPositionN() { return this.asPositionO(this.newVector()); }
  asPosition() { return this.asPositionO(this); }
  asDirectionO(result?: Vector) {
    result || (result = this.newVector());
    return result.set(this.x, this.y, this.z, 0);
  }
  asDirectionN() { return this.asDirectionO(this.newVector()); }
  asDirection() { return this.asDirectionO(this); }

  asCartesianPositionO(result?: Vector) {
    let x = this.x;
    let y = this.y;
    let z = this.z;
    let w = this.w;

    if (w !== 0 && w !== 1) {
      w = 1 / w;
      x *= w;
      y *= w;
      z *= w;
    }

    result || (result = this.newVector());
    return result.set(x, y, z, 1);
  }
  asCartesianPositionN() { return this.asCartesianPositionO(this.newVector()); }
  asCartesianPosition() { return this.asCartesianPositionO(this); }

  asCartesianDirectionO(result?: Vector) {
    let x = this.x;
    let y = this.y;
    let z = this.z;
    let w = this.w;

    if (w !== 0 && w !== 1) {
      w = 1 / w;
      x *= w;
      y *= w;
      z *= w;
    }

    result || (result = this.newVector());
    return result.set(x, y, z, 0);
  }
  asCartesianDirectionN() { return this.asCartesianDirectionO(this.newVector()); }
  asCartesianDirection() { return this.asCartesianDirectionO(this); }

  displaceByO(other: Vector, result?: Vector) {
    let ox = other.x;
    let oy = other.y;
    let oz = other.z;
    let ow = other.w;

    if (ow !== 0 && ow !== 1) {
      ow = 1 / ow;
      ox *= ow;
      oy *= ow;
      oz *= ow;
    }

    let x = this.x;
    let y = this.y;
    let z = this.z;
    let w = this.w;

    if (w !== 0 && w !== 1) {
      ox *= w;
      oy *= w;
      oz *= w;
    }

    result || (result = this.newVector());
    return result.set(x + ox, y + oy, z + oz, w);
  }
  displaceByN(other: Vector) { return this.displaceByO(other, this.newVector()); }
  displaceBy(other: Vector) { return this.displaceByO(other, this); }

  displaceByScaledO(other: Vector, scale: number, result?: Vector) {
    let ox = other.x * scale;
    let oy = other.y * scale;
    let oz = other.z * scale;
    let ow = other.w;

    if (ow !== 0 && ow !== 1) {
      ow = 1 / ow;
      ox *= ow;
      oy *= ow;
      oz *= ow;
    }

    let x = this.x;
    let y = this.y;
    let z = this.z;
    let w = this.w;

    if (w !== 0 && w !== 1) {
      ox *= w;
      oy *= w;
      oz *= w;
    }

    result || (result = this.newVector());
    return result.set(x + ox, y + oy, z + oz, w);
  }
  displaceByScaledN(other: Vector, scale: number) { return this.displaceByScaledO(other, scale, this.newVector()); }
  displaceByScaled(other: Vector, scale: number) { return this.displaceByScaledO(other, scale, this); }

  addO(other: Vector, result?: Vector) {
    result || (result = this.newVector());
    return result.set(this.x + other.x, this.y + other.y, this.z + other.z, this.w + other.w);
  }
  addN(other: Vector) { return this.addO(other, this.newVector()); }
  add(other: Vector) { return this.addO(other, this); }

  subO(other: Vector, result?: Vector) {
    result || (result = this.newVector());
    return result.set(this.x - other.x, this.y - other.y, this.z - other.z, this.w - other.w);
  }
  subN(other: Vector) { return this.subO(other, this.newVector()); }
  sub(other: Vector) { return this.subO(other, this); }

  // TODO: Doesn't change angle. Should not change cached angle.
  scaleO(scale: number, result?: Vector) {
    result || (result = this.newVector());
    return result.set(this.x * scale, this.y * scale, this.z * scale, this.w);
  }
  scaleN(scale: number) { return this.scaleO(scale, this.newVector()); }
  scale(scale: number) { return this.scaleO(scale, this); }

  addScaledO(other: Vector, scale: number, result?: Vector) {
    result || (result = this.newVector());
    return result.set(this.x + other.x * scale, this.y + other.y * scale, this.z + other.z * scale, this.w + other.w);
  }
  addScaledN(other: Vector, scale: number) { return this.addScaledO(other, scale, this.newVector()); }
  addScaled(other: Vector, scale: number) { return this.addScaledO(other, scale, this); }

  normalizeScaleO(scale: number, result?: Vector) {
    let x = this.x;
    let y = this.y;
    let z = this.z;
    let w = this.w;

    if (w !== 0 && w !== 1) {
      w = 1 / w;
      x *= w;
      y *= w;
      z *= w;
      w = 1;
    }

    result || (result = this.newVector());
    const magInv = 1 / this.mag;
    return result.set(x * magInv * scale, y * magInv * scale, z * magInv * scale, w);
  }
  normalizeScaleN(scale: number) { return this.normalizeScaleO(scale, this.newVector()); }
  normalizeScale(scale: number) { return this.normalizeScaleO(scale, this); }

  multO(other: Vector, result?: Vector): Vector;
  multO(scaleX: number, result?: Vector): Vector;
  multO(scaleX: number, scaleY: number, result?: Vector): Vector;
  multO(scaleX: number, scaleY: number, scaleZ: number, result?: Vector): Vector;
  multO(param1: Vector | number, param2?: any, param3?: any, param4?: Vector): Vector {
    let scaleX: number;
    let scaleY: number;
    let scaleZ: number;
    let result: Vector;

    if (param1 instanceof Vector) {
      scaleX = param1.x;
      scaleY = param1.y;
      scaleZ = param1.z;
      result = param2 || this.newVector();
    } else if (arguments.length === 2) {
      scaleX = param1;
      scaleY = 1;
      scaleZ = 1;
      result = param3 || this.newVector();
    } else if (arguments.length === 3) {
      scaleX = param1;
      scaleY = param2;
      scaleZ = 1;
      result = param3 || this.newVector();
    } else {
      scaleX = param1;
      scaleY = param2;
      scaleZ = param3;
      result = param4 || this.newVector();
    }

    return result.set(this.x * scaleX, this.y * scaleY, this.z * scaleZ, this.w);
  }
  multN(other: Vector): Vector;
  multN(scaleX: number, scaleY: number): Vector;
  multN(scaleX: number, scaleY: number, scaleZ: number): Vector;
  multN(param1: Vector | number, scaleY?: number, scaleZ?: number): Vector {
    if (param1 instanceof Vector)
      return this.multO(param1, this.newVector());

    if (arguments.length === 2)
      return this.multO(param1, scaleY!, this.newVector());

    return this.multO(param1, scaleY!, scaleZ!, this.newVector());
  }
  mult(other: Vector): Vector;
  mult(scaleX: number, scaleY: number): Vector;
  mult(scaleX: number, scaleY: number, scaleZ: number): Vector;
  mult(param1: Vector | number, scaleY?: number, scaleZ?: number): Vector {
    if (param1 instanceof Vector)
      return this.multO(param1, this);

    if (arguments.length === 2)
      return this.multO(param1, scaleY!, this);

    return this.multO(param1, scaleY!, scaleZ!, this);
  }

  divO(scale: number, result?: Vector) {
    result || (result = this.newVector());
    scale = 1 / scale;
    return result.set(this.x * scale, this.y * scale, this.z * scale, this.w);
  }
  divN(scale: number) { return this.divO(scale, this.newVector()); }
  div(scale: number) { return this.divO(scale, this); }

  // TODO: Doesn't change magnitude. Should not change cached values.
  negateO(result?: Vector) {
    result || (result = this.newVector());
    return result.set(-this.x, -this.y, -this.z, this.w);
  }
  negateN() { return this.negateO(this.newVector()); }
  negate() { return this.negateO(this); }

  normalizeO(result?: Vector) {
    let x = this.x;
    let y = this.y;
    let z = this.z;
    let w = this.w;

    if (w !== 0 && w !== 1) {
      w = 1 / w;
      x *= w;
      y *= w;
      z *= w;
      w = 1;
    }

    result || (result = this.newVector());
    const magInv = 1 / this.mag;
    return result.set(x * magInv, y * magInv, z * magInv, w);
  }
  normalizeN() { return this.normalizeO(this.newVector()); }
  normalize() { return this.normalizeO(this); }

  // TODO: Proper 3D implementation.
  // TODO: Doesn't change magnitude. Should not change cached values.
  rotateO(radians: number, result?: Vector) {
    const sin = Math.sin(radians);
    const cos = Math.cos(radians);
    const x = this.x;
    const y = this.y;

    result || (result = this.newVector());
    return result.set(x * cos - y * sin, x * sin + y * cos, this.z, this.w);
  }
  rotateN(radians: number) { return this.rotateO(radians, this.newVector()); }
  rotate(radians: number) { return this.rotateO(radians, this); }

  // TODO: Proper 3D implementation.
  rotateAboutO(center: Vector, radians: number, result?: Vector) {
    const sin = Math.sin(radians);
    const cos = Math.cos(radians);
    let x = this.x - center.x;
    let y = this.y - center.y;
    let rx = x * cos - y * sin;
    let ry = x * sin + y * cos;
    rx += center.x;
    ry += center.y;

    result || (result = this.newVector());
    return result.set(rx, ry, this.z, this.w);
  }
  rotateAboutN(center: Vector, radians: number) { return this.rotateAboutO(center, radians, this.newVector()); }
  rotateAbout(center: Vector, radians: number) { return this.rotateAboutO(center, radians, this); }

  // TODO: Proper 3D implementation.
  rotateOneDegreeO(result?: Vector) {
    const x = this.x;
    const y = this.y;
    result || (result = this.newVector());
    return result.set(x * MathEx.COS1 - y * MathEx.SIN1, x * MathEx.SIN1 + y * MathEx.COS1, this.z, this.w);
  }
  rotateOneDegreeN() { return this.rotateOneDegreeO(this.newVector()); }
  rotateOneDegree() { return this.rotateOneDegreeO(this); }

  // TODO: Proper 3D implementation.
  rotateNegativeOneDegreeO(result?: Vector) {
    const x = this.x;
    const y = this.y;
    result || (result = this.newVector());
    return result.set(x * MathEx.COSN1 - y * MathEx.SINN1, x * MathEx.SINN1 + y * MathEx.COSN1, this.z, this.w);
  }
  rotateNegativeOneDegreeN() { return this.rotateNegativeOneDegreeO(this.newVector()); }
  rotateNegativeOneDegree() { return this.rotateNegativeOneDegreeO(this); }

  // TODO: Proper 3D implementation.
  // TODO: Doesn't change magnitude. Should not change cached values.
  perpLeftO(result?: Vector) {
    result || (result = this.newVector());
    return result.set(-this.y, this.x, this.z, this.w);
  }
  perpLeftN() { return this.perpLeftO(this.newVector()); }
  perpLeft() { return this.perpLeftO(this); }

  // TODO: Proper 3D implementation.
  perpRightO(result?: Vector) {
    result || (result = this.newVector());
    return result.set(this.y, -this.x, this.z, this.w);
  }
  perpRightN() { return this.perpRightO(this.newVector()); }
  perpRight() { return this.perpRightO(this); }

  perpO = this.perpLeftO;
  perpN = this.perpLeftN;
  perp = this.perpLeft;

  projectionLength(other: Vector) { return this.dot(other) / other.dot(other); }

  projectOntoUnitO(unitVector: Vector, result?: Vector) { return unitVector.scaleO(this.dot(unitVector), result); }
  projectOntoUnitN(unitVector: Vector) { return this.projectOntoUnitO(unitVector, this.newVector()); }
  projectOntoUnit(unitVector: Vector) { return this.projectOntoUnitO(unitVector, this); }

  projectOntoO(other: Vector, result?: Vector) { return other.scaleO(this.dot(other) / other.dot(other), result); }
  projectOntoN(other: Vector) { return this.projectOntoO(other, this.newVector()); }
  projectOnto(other: Vector) { return this.projectOntoO(other, this); }

  reflectViaNormalO(normal: Vector, result?: Vector) {
    // -(2 * (v . normal) * normal - v)
    let dot2 = 2 * this.dot(normal);
    let dot2TimesNormal = normal.scaleN(dot2);
    result || (result = this.newVector());
    return result.copyFrom(dot2TimesNormal.sub(this).negate());

    // v - 2 * (v . normal) * normal
    // return result.copyFrom(this.sub(dot2TimesNormal));
  }
  reflectViaNormalN(normal: Vector) { return this.reflectViaNormalO(normal, this.newVector()); }
  reflectViaNormal(normal: Vector) { return this.reflectViaNormalO(normal, this); }

  reflectOffO(reflector: Vector, result?: Vector): Vector { return this.reflectViaNormalO(reflector.normal, result); }
  reflectOffN(reflector: Vector): Vector { return this.reflectOffO(reflector, this.newVector()); }
  reflectOff(reflector: Vector): Vector { return this.reflectOffO(reflector, this); }

  reflectO(source: Vector, result?: Vector): Vector { return source.reflectViaNormalO(this.normal, result); }
  reflectN(source: Vector): Vector { return this.reflectO(source, this.newVector()); }
  reflect(source: Vector): Vector { return this.reflectO(source, this); }

  // TODO: Proper 3D implementation.
  radiansBetween(target: Vector): number {
    const result = Math.atan2(this.x * target.y - this.y * target.x, this.x * target.x + this.y * target.y);
    return result > 0 ? result : result + MathEx.TWO_PI;
  }

  clampO(min: Vector, max: Vector, result?: Vector) {
    result || (result = this.newVector());
    // TODO: Account for w.
    return result.set(
      this.x < min.x ? min.x : this.x > max.x ? max.x : this.x,
      this.y < min.y ? min.y : this.y > max.y ? max.y : this.y,
      this.z < min.z ? min.z : this.z > max.z ? max.z : this.z,
      this.w
    );
  }
  clampN(min: Vector, max: Vector) { return this.clampO(min, max, this.newVector()); }
  clamp(min: Vector, max: Vector) { return this.clampO(min, max, this); }

  clampMinO(min: Vector, result?: Vector) {
    result || (result = this.newVector());
    // TODO: Account for w.
    return result.set(
      this.x < min.x ? min.x : this.x,
      this.y < min.y ? min.y : this.y,
      this.z < min.z ? min.z : this.z,
      this.w
    );
  }
  clampMinN(min: Vector) { return this.clampMinO(min, this.newVector()); }
  clampMin(min: Vector) { return this.clampMinO(min, this); }

  clampMaxO(max: Vector, result?: Vector) {
    result || (result = this.newVector());
    // TODO: Account for w.
    return result.set(
      this.x > max.x ? max.x : this.x,
      this.y > max.y ? max.y : this.y,
      this.z > max.z ? max.z : this.z,
      this.w
    );
  }
  clampMaxN(max: Vector) { return this.clampMaxO(max, this.newVector()); }
  clampMax(max: Vector) { return this.clampMaxO(max, this); }

  toPixelsO(result?: Vector, pixelsPerMeter: number = Vector.pixelsPerMeter) {
    result || (result = this.newVector());
    return result.set(this.x * pixelsPerMeter, this.y * pixelsPerMeter, this.z * pixelsPerMeter, this.w);
  }
  toPixelsN(pixelsPerMeter: number = Vector.pixelsPerMeter) {
    return this.toPixelsO(this.newVector(), pixelsPerMeter);
  }
  toPixels(pixelsPerMeter: number = Vector.pixelsPerMeter) { return this.toPixelsO(this, pixelsPerMeter); }

  toMetersO(result?: Vector, pixelsPerMeter: number = Vector.pixelsPerMeter) {
    result || (result = this.newVector());
    const inverse = 1 / pixelsPerMeter;
    return result.set(this.x * inverse, this.y * inverse, this.z * inverse, this.w);
  }
  toMetersN(pixelsPerMeter: number = Vector.pixelsPerMeter) {
    return this.toMetersO(this.newVector(), pixelsPerMeter);
  }
  toMeters(pixelsPerMeter: number = Vector.pixelsPerMeter) { return this.toMetersO(this, pixelsPerMeter); }

  // DONE: Refactor WithElement methods to directly update elements.
  //       Don't directly update elements because cached values need to be cleared.
  withXYZWO(x: number, y: number, z: number, w: number, result?: Vector) {
    result || (result = this.newVector());
    return result.set(x, y, z, w);
  }
  withXYZWN(x: number, y: number, z: number, w: number) { return this.withXYZWO(x, y, z, w, this.newVector()); }
  withXYZW(x: number, y: number, z: number, w: number) { return this.withXYZWO(x, y, z, w, this); }

  withXYZO(x: number, y: number, z: number, result?: Vector) {
    result || (result = this.newVector());
    return result.set(x, y, z, this.w);
  }
  withXYZN(x: number, y: number, z: number) { return this.withXYZO(x, y, z, this.newVector()); }
  withXYZ(x: number, y: number, z: number) { return this.withXYZO(x, y, z, this); }

  withXYWO(x: number, y: number, w: number, result?: Vector) {
    result || (result = this.newVector());
    return result.set(x, y, this.z, w);
  }
  withXYWN(x: number, y: number, w: number) { return this.withXYWO(x, y, w, this.newVector()); }
  withXYW(x: number, y: number, w: number) { return this.withXYWO(x, y, w, this); }

  withXYO(x: number, y: number, result?: Vector) {
    result || (result = this.newVector());
    return result.set(x, y, this.z, this.w);
  }
  withXYN(x: number, y: number) { return this.withXYO(x, y, this.newVector()); }
  withXY(x: number, y: number) { return this.withXYO(x, y, this); }

  withXO(x: number, result?: Vector) {
    result || (result = this.newVector());
    return result.set(x, this.y, this.z, this.w);
  }
  withXN(x: number) { return this.withXO(x, this.newVector()); }
  withX(x: number) { return this.withXO(x, this); }

  withYO(y: number, result?: Vector) {
    result || (result = this.newVector());
    return result.set(this.x, y, this.z, this.w);
  }
  withYN(y: number) { return this.withYO(y, this.newVector()); }
  withY(y: number) { return this.withYO(y, this); }

  withZO(z: number, result?: Vector) {
    result || (result = this.newVector());
    return result.set(this.x, this.y, z, this.w);
  }
  withZN(z: number) { return this.withZO(z, this.newVector()); }
  withZ(z: number) { return this.withZO(z, this); }

  withWO(w: number, result?: Vector) {
    result || (result = this.newVector());
    return result.set(this.x, this.y, this.z, w);
  }
  withWN(w: number) { return this.withWO(w, this.newVector()); }
  withW(w: number) { return this.withWO(w, this); }

  withNegXO(result?: Vector) {
    result || (result = this.newVector());
    return result.set(-this.x, this.y, this.z, this.w);
  }
  withNegXN() { return this.withNegXO(this.newVector()); }
  withNegX() { return this.withNegXO(this); }

  withNegYO(result?: Vector) {
    result || (result = this.newVector());
    return result.set(this.x, -this.y, this.z, this.w);
  }
  withNegYN() { return this.withNegYO(this.newVector()); }
  withNegY() { return this.withNegYO(this); }

  withNegZO(result?: Vector) {
    result || (result = this.newVector());
    return result.set(this.x, this.y, -this.z, this.w);
  }
  withNegZN() { return this.withNegZO(this.newVector()); }
  withNegZ() { return this.withNegZO(this); }

  withRadiansO(radians: number, result?: Vector) {
    result || (result = this.newVector());
    // TODO: Not valid for 3D.
    if (result === this) {
      this.set(Math.cos(radians), Math.sin(radians), 0, this.w);
      this._radians = radians;
      return this;
    }

    result.w = this.w;
    result.withRadiansO(radians, result);
    return result;
  }
  withRadiansN(radians: number) { return this.withRadiansO(radians, this.newVector()); }
  withRadians(radians: number) { return this.withRadiansO(radians, this); }

  withDegreesO(degrees: number, result?: Vector) {
    // TODO: Not valid for 3D.
    return this.withRadiansO(degrees * MathEx.ONE_DEGREE, result);
  }
  withDegreesN(degrees: number) { return this.withDegreesO(degrees, this.newVector()); }
  withDegrees(degrees: number) { return this.withDegreesO(degrees, this); }

  withRadiansMagO(radians: number, mag: number, result?: Vector) {
    result || (result = this.newVector());
    // TODO: Not valid for 3D.
    if (result === this) {
      this.set(Math.cos(radians) * mag, Math.sin(radians) * mag, 0, this.w);
      this._radians = radians;
      this._mag = mag;
      this._magSquared = mag * mag;
      return this;
    }

    result.w = this.w;
    result.withRadiansMagO(radians, mag, result);
    return result;
  }

  withRadiansMagN(radians: number, mag: number) { return this.withRadiansMagO(radians, mag, this.newVector()); }
  withRadiansMag(radians: number, mag: number) { return this.withRadiansMagO(radians, mag, this); }

  withDegreesMagO(degrees: number, mag: number, result?: Vector) {
    // TODO: Not valid for 3D.
    return this.withRadiansMagO(degrees * MathEx.ONE_DEGREE, mag, result);
  }
  withDegreesMagN(degrees: number, mag: number) { return this.withDegreesMagO(degrees, mag, this.newVector()); }
  withDegreesMag(degrees: number, mag: number) { return this.withDegreesMagO(degrees, mag, this); }

  withMagO(mag: number, result?: Vector) {
    let x = this.x;
    let y = this.y;
    let z = this.z;
    let w = this.w;

    if (w !== 0 && w !== 1) {
      w = 1 / w;
      x *= w;
      y *= w;
      z *= w;
      w = 1;
    }

    result || (result = this.newVector());
    const magInv = 1 / this.mag;
    return result.set(x * magInv * mag, y * magInv * mag, z * magInv * mag, w);
  }
  withMagN(scale: number) { return this.withMagO(scale, this.newVector()); }
  withMag(scale: number) { return this.withMagO(scale, this); }

  equals(other: Vector, epsilon: number = MathEx.epsilon) {
    let w = this.w;
    let ow = other.w;

    if ((w === 0 && ow !== 0) || (w === 1 && ow !== 1)) return false;

    let x = this.x;
    let y = this.y;
    let z = this.z;

    let ox = other.x;
    let oy = other.y;
    let oz = other.z;

    if (w !== 0 && w !== 1) {
      w = 1 / w;
      x *= w;
      y *= w;
      z *= w;
    }

    if (ow !== 0 && ow !== 1) {
      ow = 1 / ow;
      ox *= ow;
      oy *= ow;
      oz *= ow;
    }

    return Math.abs(x - ox) < epsilon && Math.abs(y - oy) < epsilon && Math.abs(z - oz) < epsilon;
  }

  // @ts-ignore - unused param.
  renderCore(viewport: Viewport, origin: Vector) { }

  // @ts-ignore - unused param.
  render(viewport: Viewport, origin?: Vector, props?: ContextProps) {
    origin = origin || Vector.createPosition(0, 0);
    props = props || { strokeStyle: "black", fillStyle: "black" };
    let lineWidth = viewport.calcLineWidth(props.lineWidth !== undefined ? props.lineWidth : 1);
    viewport.ctx.withProps(props).withLineWidth(lineWidth);

    this.renderCore(viewport, origin);
  }

  toString(precision: number = 2) {
    return this.isPosition
      ? `[${this.x.toFixed(precision)}, ${this.y.toFixed(precision)}, ${this.z.toFixed(precision)}, ${this.w.toFixed(precision)}]`
      : `<${this.x.toFixed(precision)}, ${this.y.toFixed(precision)}, ${this.z.toFixed(precision)}, ${this.w.toFixed(precision)}>`;
  }

  protected clear(instance: Vector) {
    if (instance._magSquared !== undefined)
      instance._magSquared = undefined;

    if (instance._mag !== undefined)
      instance._mag = undefined;

    if (instance._radians !== undefined)
      instance._radians = undefined;

    return instance;
  }
}
