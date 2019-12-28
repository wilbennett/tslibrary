import { Vector, Vector2 } from '.';

export class Vector2D extends Vector2 {
  constructor();
  constructor(x: number);
  constructor(x: number, y: number);
  constructor(x: number, y: number, w: number);
  constructor(x: number, y: number, z: number, w: number);
  constructor(x?: number, y?: number, param3?: number, param4?: number) {
    super();
    this._x = x || 0;
    this._y = y || 0;
    this._w = param3 || 0;

    if (arguments.length === 4)
      this._w = param4 || 0;
  }

  static get elementCount() { return 3; }
  get elementCount() { return Vector2D.elementCount; }
  private _x: number;
  get x() { return this._x; }
  set x(value) { this._x = value; }
  private _y: number;
  get y() { return this._y; }
  set y(value) { this._y = value; }
  private _w: number;
  get w() { return this._w; }
  set w(value) { this._w = value; }
  private __magSquared?: number;
  protected get _magSquared(): number | undefined { return this.__magSquared; }
  protected set _magSquared(value) { this.__magSquared = value; }
  private __mag?: number;
  protected get _mag(): number | undefined { return this.__mag; }
  protected set _mag(value) { this.__mag = value; }
  private __radians?: number;
  protected get _radians(): number | undefined { return this.__radians; }
  protected set _radians(value) { this.__radians = value; }

  // TODO: Need to revisit these.
  // Should be immutable? Should allow being part of calculations?
  private static _zeroPosition: Vector;
  static get zeroPosition() { return Vector2D._zeroPosition || (Vector2D._zeroPosition = new Vector2ZeroPosition()); }
  private static _zeroDirection: Vector;
  static get zeroDirection() { return Vector2D._zeroDirection || (Vector2D._zeroDirection = new Vector2ZeroDirection()); }

  clone(result?: Vector): Vector {
    if (result) {
      if (!(result instanceof Vector2D))
        return result.copyFrom(this);

      result.x = this.x;
      result.y = this.y;
      result.w = this.w;

      result.__mag = this.__mag;
      result.__magSquared = this.__magSquared;
      result.__radians = this.__radians;

      return result;
    }

    const res = new Vector2D(this.x, this.y, this.w);
    res.__mag = this.__mag;
    res.__magSquared = this.__magSquared;
    res.__radians = this.__radians;
    return res;
  }

  addO(other: Vector, result?: Vector): Vector {
    if (result) {
      if (!(result instanceof Vector2D))
        return result.set(this.x + other.x, this.y + other.y, 0, this.w + other.w);

      result.x = this.x + other.x;
      result.y = this.y + other.y;
      result.w = this.w + other.w;

      result.__mag = undefined;
      result.__magSquared = undefined;
      result.__radians = undefined;

      return result;
    }

    return new Vector2D(this.x + other.x, this.y + other.y, this.w + other.w);
  }
  add(other: Vector): Vector {
    this.x += other.x;
    this.y += other.y;
    this.w += other.w;

    this.__mag = undefined;
    this.__magSquared = undefined;
    this.__radians = undefined;

    return this;
  }
  addScaledO(other: Vector, scale: number, result?: Vector): Vector {
    if (result) {
      if (!(result instanceof Vector2D))
        return result.set(this.x + other.x * scale, this.y + other.y * scale, 0, this.w + other.w);

      result.x = this.x + other.x * scale;
      result.y = this.y + other.y * scale;
      result.w = this.w + other.w;

      result.__mag = undefined;
      result.__magSquared = undefined;
      result.__radians = undefined;

      return result;
    }

    return new Vector2D(this.x + other.x * scale, this.y + other.y * scale, this.w + other.w);
  }
  addScaled(other: Vector, scale: number): Vector {
    this.x += other.x * scale;
    this.y += other.y * scale;
    this.w += other.w;

    this.__mag = undefined;
    this.__magSquared = undefined;
    this.__radians = undefined;

    return this;
  }
  displaceByO(other: Vector, result?: Vector): Vector {
    if (result) {
      if (!(result instanceof Vector2D))
        return result.set(this.x + other.x, this.y + other.y, 0, this.w);

      result.x = this.x + other.x;
      result.y = this.y + other.y;
      result.w = this.w;

      result.__mag = undefined;
      result.__magSquared = undefined;
      result.__radians = undefined;

      return result;
    }

    return new Vector2D(this.x + other.x, this.y + other.y, this.w);
  }
  displaceBy(other: Vector): Vector {
    this.x += other.x;
    this.y += other.y;

    this.__mag = undefined;
    this.__magSquared = undefined;
    this.__radians = undefined;

    return this;
  }
  subO(other: Vector, result?: Vector): Vector {
    if (result) {
      if (!(result instanceof Vector2D))
        return result.set(this.x - other.x, this.y - other.y, 0, this.w - other.w);

      result.x = this.x - other.x;
      result.y = this.y - other.y;
      result.w = this.w - other.w;

      result.__mag = undefined;
      result.__magSquared = undefined;
      result.__radians = undefined;

      return result;
    }

    return new Vector2D(this.x - other.x, this.y - other.y, this.w - other.w);
  }
  sub(other: Vector): Vector {
    this.x -= other.x;
    this.y -= other.y;
    this.w -= other.w;

    this.__mag = undefined;
    this.__magSquared = undefined;
    this.__radians = undefined;

    return this;
  }
  displaceByNegO(other: Vector, result?: Vector): Vector {
    if (result) {
      if (!(result instanceof Vector2D))
        return result.set(this.x - other.x, this.y - other.y, 0, this.w);

      result.x = this.x - other.x;
      result.y = this.y - other.y;
      result.w = this.w;

      result.__mag = undefined;
      result.__magSquared = undefined;
      result.__radians = undefined;

      return result;
    }

    return new Vector2D(this.x - other.x, this.y - other.y, this.w);
  }
  displaceByNeg(other: Vector): Vector {
    this.x -= other.x;
    this.y -= other.y;

    this.__mag = undefined;
    this.__magSquared = undefined;
    this.__radians = undefined;

    return this;
  }
  scaleO(scale: number, result?: Vector): Vector {
    if (result) {
      if (!(result instanceof Vector2D))
        return result.set(this.x * scale, this.y * scale, 0, this.w);

      result.x = this.x * scale;
      result.y = this.y * scale;
      result.w = this.w;

      result.__mag = undefined;
      result.__magSquared = undefined;
      result.__radians = undefined;

      return result;
    }

    return new Vector2D(this.x * scale, this.y * scale, this.w);
  }
  scale(scale: number): Vector {
    this.x *= scale;
    this.y *= scale;

    this.__mag = undefined;
    this.__magSquared = undefined;
    this.__radians = undefined;

    return this;
  }
  negateO(result?: Vector): Vector {
    if (result) {
      if (!(result instanceof Vector2D))
        return result.set(-this.x, -this.y, 0, this.w);

      result.x = -this.x;
      result.y = -this.y;
      result.w = this.w;

      result.__radians = undefined;

      return result;
    }

    return new Vector2D(-this.x, -this.y, this.w);
  }
  negate(): Vector {
    this.x = -this.x;
    this.y = -this.y;

    this.__radians = undefined;

    return this;
  }
  normalizeO(result?: Vector): Vector {
    let x = this.x;
    let y = this.y;
    let w = this.w;

    if (w !== 0 && w !== 1) {
      w = 1 / w;
      x *= w;
      y *= w;
      w = 1;
    }

    const magInv = 1 / this.mag;

    if (isFinite(magInv)) {
      if (result) {
        if (!(result instanceof Vector2D))
          return result.set(x * magInv, y * magInv, 0, w);

        result.x = x * magInv;
        result.y = y * magInv;
        result.w = w;

        result.__mag = 1;
        result.__magSquared = 1;
      }

      return new Vector2D(x * magInv, y * magInv, w);
    } else {
      if (result) {
        if (!(result instanceof Vector2D))
          return result.set(0, 0, 0, w);

        result.x = 0;
        result.y = 0;
        result.w = w;

        result.__mag = 0;
        result.__magSquared = 0;
        result.__radians = 0;
      }

      return new Vector2D(0, 0, w);
    }
  }
  normalize(): Vector {
    let x = this.x;
    let y = this.y;
    let w = this.w;

    if (w !== 0 && w !== 1) {
      w = 1 / w;
      x *= w;
      y *= w;
      w = 1;
    }

    const magInv = 1 / this.mag;

    if (isFinite(magInv)) {
      this.x = x * magInv;
      this.y = y * magInv;
      this.w = w;

      this.__mag = 1;
      this.__magSquared = 1;
    } else {
      this.x = 0;
      this.y = 0;
      this.w = w;

      this.__mag = 0;
      this.__magSquared = 0;
      this.__radians = 0;
    }

    return this;
  }
  perpLeftO(result?: Vector): Vector {
    if (result) {
      if (!(result instanceof Vector2D))
        return result.set(-this.y, this.x, 0, this.w);

      result.x = -this.y;
      result.y = this.x;
      result.w = this.w;

      result.__radians = undefined;
      return result;
    }

    return new Vector2D(-this.y, this.x, this.w);
  }
  perpLeft(): Vector {
    this.x = -this.y;
    this.y = this.x;

    this.__radians = undefined;
    return this;
  }
  perpRightO(result?: Vector): Vector {
    if (result) {
      if (!(result instanceof Vector2D))
        return result.set(this.y, -this.x, 0, this.w);

      result.x = this.y;
      result.y = -this.x;
      result.w = this.w;

      result.__radians = undefined;
      return result;
    }

    return new Vector2D(this.y, -this.x, this.w);
  }
  perpRight(): Vector {
    this.x = this.y;
    this.y = -this.x;

    this.__radians = undefined;
    return this;
  }
  withXYO(x: number, y: number, result?: Vector): Vector {
    if (result) {
      if (!(result instanceof Vector2D))
        return result.set(x, y, 0, this.w);

      result.x = x;
      result.y = y;
      result.w = this.w;

      result.__mag = undefined;
      result.__magSquared = undefined;
      result.__radians = undefined;

      return result;
    }

    return new Vector2D(x, y, this.w);
  }
  withXY(x: number, y: number): Vector {
    this.x = x;
    this.y = y;

    this.__mag = undefined;
    this.__magSquared = undefined;
    this.__radians = undefined;

    return this;
  }
  withXYWO(x: number, y: number, w: number, result?: Vector): Vector {
    if (result) {
      if (!(result instanceof Vector2D))
        return result.set(x, y, 0, w);

      result.x = x;
      result.y = y;
      result.w = w;

      result.__mag = undefined;
      result.__magSquared = undefined;
      result.__radians = undefined;

      return result;
    }

    return new Vector2D(x, y, w);
  }
  withXYW(x: number, y: number, w: number): Vector {
    this.x = x;
    this.y = y;
    this.w = w;

    this.__mag = undefined;
    this.__magSquared = undefined;
    this.__radians = undefined;

    return this;
  }
}

export class PVector2 extends Vector2D {
  constructor(x: number = 0, y: number = 0) {
    super(x, y, 1);
  }

  static get [Symbol.species]() { return Vector2D; }
}

export class DVector2 extends Vector2D {
  constructor(x: number = 0, y: number = 0) {
    super(x, y, 0);
  }

  static get [Symbol.species]() { return Vector2D; }
}

class Vector2ZeroPosition extends Vector2D {
  static get [Symbol.species]() { return Vector2D; }

  get w() { return 1; }
  // @ts-ignore - unused param.
  set w(value) { }

  set(x: number, y: number, z: number, w: number = 0): Vector { return new Vector2D(x, y, z, w); }
}

class Vector2ZeroDirection extends Vector2D {
  static get [Symbol.species]() { return Vector2D; }

  set(x: number, y: number, z: number, w: number = 0): Vector { return new Vector2D(x, y, z, w); }
}

Vector.instanceConstructor = Vector2D;
Vector2.instanceConstructor = Vector2D;
