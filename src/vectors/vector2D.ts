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
