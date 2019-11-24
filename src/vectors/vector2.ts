import { Vector } from '.';
import { MathEx, NumberArray } from '../core';
import { Viewport } from '../twod';

export interface Vector2Constructor {
  new(x: number, y: number, w?: number): Vector2;
}

export class Vector2 extends Vector {
  private static _instanceConstructor2: Vector2Constructor;
  static get instanceConstructor() { return this._instanceConstructor2; }
  static set instanceConstructor(value: Vector2Constructor) { this._instanceConstructor2 = value; }

  get minElement() { return Math.min(this.x, this.y); }
  get maxElement() { return Math.max(this.x, this.y); }

  get magSquared() {
    if (this._magSquared !== undefined) return this._magSquared;

    let x = this.x;
    let y = this.y;
    let w = this.w;

    if (w !== 0 && w !== 1) {
      w = 1 / w;
      x *= w;
      y *= w;
    }

    const result = x * x + y * y;
    this._magSquared = result;
    return result;
  }

  get mag() {
    if (this._mag !== undefined) return this._mag;

    const w = this.w;
    let result = Math.sqrt(this.x * this.x + this.y * this.y);

    if (w !== 0 && w !== 1)
      result /= w;

    this._mag = result;
    return result;
  }

  static create(x: number = 0, y: number = 0, w: number = 0) { return new this.instanceConstructor(x, y, w); }
  static createPosition(x: number = 0, y: number = 0) { return new this.instanceConstructor(x, y, 1); }
  static createDirection(x: number = 0, y: number = 0) { return new this.instanceConstructor(x, y, 0); }

  writeTo(data: NumberArray, index: number) {
    data[index] = this.x;
    data[index + 1] = this.y;
    data[index + 2] = this.w;
    return index + 3;
  }

  dot(other: Vector) { return this.x * other.x + this.y * other.y; }

  distanceSquared(other: Vector) {
    const deltaX = other.x - this.x;
    const deltaY = other.y - this.y;
    return deltaX * deltaX + deltaY * deltaY;
  }

  cross2D(other: Vector) { return this.x * other.y - this.y * other.x; }

  crossO(other: Vector, result?: Vector) {
    result || (result = this.newVector());
    return result.set(this.cross2D(other), 0, 0, 0);
  }

  normalizeWO(result?: Vector) {
    let x = this.x;
    let y = this.y;
    let w = this.w;

    if (w !== 0 && w !== 1) {
      w = 1 / w;
      x *= w;
      y *= w;
      w = 1;
    }

    result || (result = this.newVector());
    return result.set(x, y, 0, w);
  }

  asCartesianPositionO(result?: Vector) {
    let x = this.x;
    let y = this.y;
    let w = this.w;

    if (w !== 0 && w !== 1) {
      w = 1 / w;
      x *= w;
      y *= w;
    }

    result || (result = this.newVector());
    return result.set(x, y, 0, 1);
  }

  asCartesianDirectionO(result?: Vector) {
    let x = this.x;
    let y = this.y;
    let w = this.w;

    if (w !== 0 && w !== 1) {
      w = 1 / w;
      x *= w;
      y *= w;
    }

    result || (result = this.newVector());
    return result.set(x, y, 0, 0);
  }

  displaceByO(other: Vector, result?: Vector) {
    let ox = other.x;
    let oy = other.y;
    let ow = other.w;

    if (ow !== 0 && ow !== 1) {
      ow = 1 / ow;
      ox *= ow;
      oy *= ow;
    }

    let x = this.x;
    let y = this.y;
    let w = this.w;

    if (w !== 0 && w !== 1) {
      ox *= w;
      oy *= w;
    }

    result || (result = this.newVector());
    return result.set(x + ox, y + oy, 0, w);
  }

  displaceByNegO(other: Vector, result?: Vector) {
    let ox = other.x;
    let oy = other.y;
    let ow = other.w;

    if (ow !== 0 && ow !== 1) {
      ow = 1 / ow;
      ox *= ow;
      oy *= ow;
    }

    let x = this.x;
    let y = this.y;
    let w = this.w;

    if (w !== 0 && w !== 1) {
      ox *= w;
      oy *= w;
    }

    result || (result = this.newVector());
    return result.set(x - ox, y - oy, 0, w);
  }

  displaceByScaledO(other: Vector, scale: number, result?: Vector) {
    let ox = other.x * scale;
    let oy = other.y * scale;
    let ow = other.w;

    if (ow !== 0 && ow !== 1) {
      ow = 1 / ow;
      ox *= ow;
      oy *= ow;
    }

    let x = this.x;
    let y = this.y;
    let w = this.w;

    if (w !== 0 && w !== 1) {
      ox *= w;
      oy *= w;
    }

    result || (result = this.newVector());
    return result.set(x + ox, y + oy, 0, w);
  }

  displaceByNegScaledO(other: Vector, scale: number, result?: Vector) {
    let ox = other.x * scale;
    let oy = other.y * scale;
    let ow = other.w;

    if (ow !== 0 && ow !== 1) {
      ow = 1 / ow;
      ox *= ow;
      oy *= ow;
    }

    let x = this.x;
    let y = this.y;
    let w = this.w;

    if (w !== 0 && w !== 1) {
      ox *= w;
      oy *= w;
    }

    result || (result = this.newVector());
    return result.set(x - ox, y - oy, 0, w);
  }

  addO(other: Vector, result?: Vector) {
    result || (result = this.newVector());
    return result.set(this.x + other.x, this.y + other.y, 0, this.w + other.w);
  }
  subO(other: Vector, result?: Vector) {
    result || (result = this.newVector());
    return result.set(this.x - other.x, this.y - other.y, 0, this.w - other.w);
  }
  scaleO(scale: number, result?: Vector) {
    result || (result = this.newVector());
    return result.set(this.x * scale, this.y * scale, 0, this.w);
  }

  addScaledO(other: Vector, scale: number, result?: Vector) {
    result || (result = this.newVector());
    return result.set(this.x + other.x * scale, this.y + other.y * scale, 0, this.w + other.w);
  }

  subScaledO(other: Vector, scale: number, result?: Vector) {
    result || (result = this.newVector());
    return result.set(this.x - other.x * scale, this.y - other.y * scale, 0, this.w - other.w);
  }

  normalizeScaleO(scale: number, result?: Vector) {
    let x = this.x;
    let y = this.y;
    let w = this.w;

    if (w !== 0 && w !== 1) {
      w = 1 / w;
      x *= w;
      y *= w;
      w = 1;
    }

    result || (result = this.newVector());
    const magInv = 1 / this.mag;
    return result.set(x * magInv * scale, y * magInv * scale, 0, w);
  }

  multO(other: Vector, result?: Vector): Vector;
  multO(scaleX: number, result?: Vector): Vector;
  multO(scaleX: number, scaleY: number, result?: Vector): Vector;
  multO(scaleX: number, scaleY: number, scaleZ: number, result?: Vector): Vector;
  multO(param1: Vector | number, param2?: any, param3?: any, param4?: Vector): Vector {
    let scaleX: number;
    let scaleY: number;
    let result: Vector;

    if (param1 instanceof Vector) {
      scaleX = param1.x;
      scaleY = param1.y;
      result = param2 || this.newVector();
    } else if (arguments.length === 2) {
      scaleX = param1;
      scaleY = 1;
      result = param3 || this.newVector();
    } else if (arguments.length === 3) {
      scaleX = param1;
      scaleY = param2;
      result = param3 || this.newVector();
    } else {
      scaleX = param1;
      scaleY = param2;
      result = param4 || this.newVector();
    }

    return result.set(this.x * scaleX, this.y * scaleY, 0, this.w);
  }

  divO(scale: number, result?: Vector) {
    result || (result = this.newVector());
    scale = 1 / scale;
    return result.set(this.x * scale, this.y * scale, 0, this.w);
  }

  negateO(result?: Vector) {
    result || (result = this.newVector());
    return result.set(-this.x, -this.y, 0, this.w);
  }

  normalizeO(result?: Vector) {
    let x = this.x;
    let y = this.y;
    let w = this.w;

    if (w !== 0 && w !== 1) {
      w = 1 / w;
      x *= w;
      y *= w;
      w = 1;
    }

    result || (result = this.newVector());
    const magInv = 1 / this.mag;
    return result.set(x * magInv, y * magInv, 0, w);
  }

  perpLeftO(result?: Vector) {
    result || (result = this.newVector());
    return result.set(-this.y, this.x, 0, this.w);
  }
  perpRightO(result?: Vector) {
    result || (result = this.newVector());
    return result.set(this.y, -this.x, 0, this.w);
  }

  clampO(min: Vector, max: Vector, result?: Vector) {
    result || (result = this.newVector());
    // TODO: Account for w.
    return result.set(
      this.x < min.x ? min.x : this.x > max.x ? max.x : this.x,
      this.y < min.y ? min.y : this.y > max.y ? max.y : this.y,
      0,
      this.w
    );
  }

  clampMinO(min: Vector, result?: Vector) {
    result || (result = this.newVector());
    // TODO: Account for w.
    return result.set(
      this.x < min.x ? min.x : this.x,
      this.y < min.y ? min.y : this.y,
      0,
      this.w
    );
  }

  clampMaxO(max: Vector, result?: Vector) {
    result || (result = this.newVector());
    // TODO: Account for w.
    return result.set(
      this.x > max.x ? max.x : this.x,
      this.y > max.y ? max.y : this.y,
      0,
      this.w
    );
  }

  toPixelsO(result?: Vector, pixelsPerMeter: number = Vector.pixelsPerMeter) {
    result || (result = this.newVector());
    return result.set(this.x * pixelsPerMeter, this.y * pixelsPerMeter, 0, this.w);
  }

  toMetersO(result?: Vector, pixelsPerMeter: number = Vector.pixelsPerMeter) {
    result || (result = this.newVector());
    const inverse = 1 / pixelsPerMeter;
    return result.set(this.x * inverse, this.y * inverse, 0, this.w);
  }

  equals(other: Vector, epsilon: number = MathEx.epsilon) {
    let w = this.w;
    let ow = other.w;

    if ((w === 0 && ow !== 0) || (w === 1 && ow !== 1)) return false;

    let x = this.x;
    let y = this.y;

    let ox = other.x;
    let oy = other.y;

    if (w !== 0 && w !== 1) {
      w = 1 / w;
      x *= w;
      y *= w;
    }

    if (ow !== 0 && ow !== 1) {
      ow = 1 / ow;
      ox *= ow;
      oy *= ow;
    }

    return Math.abs(x - ox) < epsilon && Math.abs(y - oy) < epsilon;
  }

  toString(precision: number = 2) {
    return this.isPosition
      ? `[${this.x.toFixed(precision)}, ${this.y.toFixed(precision)}, ${this.w.toFixed(precision)}]`
      : `<${this.x.toFixed(precision)}, ${this.y.toFixed(precision)}, ${this.w.toFixed(precision)}>`;
  }

  renderCore(viewport: Viewport, origin: Vector) {
    const ctx = viewport.ctx;

    if (this.isPosition) {
      ctx.beginPath().fillCircle(this, Vector.tipDrawHeight * 0.5);
      return;
    }

    const mag = this.mag;
    const triHeight = Math.min(mag * 0.25, Vector.tipDrawHeight);
    const angle = -90 * MathEx.ONE_DEGREE + this.radians;

    ctx.pushTransform();

    ctx.translate(origin.x, origin.y)
      .rotate(angle)
      .beginPath()
      .line(0, 0, 0, mag - triHeight);

    ctx.translate(0, mag - triHeight)
      .lineTo(triHeight * 0.5, 0)
      .lineTo(0, triHeight)
      .lineTo(-triHeight * 0.5, 0)
      .lineTo(0, 0)
      .stroke()
      .fill();

    ctx.popTransform();
  }
}
