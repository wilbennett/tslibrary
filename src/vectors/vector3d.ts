import { Vector, Vector3 } from '.';

export class Vector3D extends Vector3 {
    constructor(x?: number, y?: number, z?: number, w?: number) {
        super();
        this._x = x || 0;
        this._y = y || 0;
        this._z = z || 0;
        this._w = w || 0;
    }

    static get elementCount() { return 3; }
    private _x: number;
    get x() { return this._x; }
    set x(value) { this._x = value; }
    private _y: number;
    get y() { return this._y; }
    set y(value) { this._y = value; }
    private _z: number;
    get z() { return this._z; }
    set z(value) { this._z = value; }
    private _w: number;
    get w() { return this._w; }
    set w(value) { this._w = value; }
    private __magSquared?: number;
    protected get _magSquared(): number | undefined { return this.__magSquared; }
    protected set _magSquared(value) { this.__magSquared = value; }
    private __mag?: number;
    protected get _mag(): number | undefined { return this.__mag; }
    protected set _mag(value) { this.__magSquared = value; }

    private static _zeroPosition: Vector;
    static get zeroPosition() { return Vector3D._zeroPosition || (Vector3D._zeroPosition = new Vector3ZeroPosition()); }
    private static _zeroDirection: Vector;
    static get zeroDirection() { return Vector3D._zeroDirection || (Vector3D._zeroDirection = new Vector3ZeroDirection()); }
}

export class PVector3 extends Vector3D {
    constructor(x: number = 0, y: number = 0, z: number = 0) {
        super(x, y, z, 1);
    }

    static get [Symbol.species]() { return Vector3D; }
}

export class DVector3 extends Vector3D {
    constructor(x: number = 0, y: number = 0, z: number = 0) {
        super(x, y, z, 0);
    }

    static get [Symbol.species]() { return Vector3D; }
}

class Vector3ZeroPosition extends Vector3D {
    static get [Symbol.species]() { return Vector3D; }

    get w() { return 1; }
    // @ts-ignore - unused param.
    set w(value) { }

    set(x: number, y: number, z: number, w: number = 0): Vector { return new Vector3D(x, y, z, w); }
}

class Vector3ZeroDirection extends Vector3D {
    static get [Symbol.species]() { return Vector3D; }

    set(x: number, y: number, z: number, w: number = 0): Vector { return new Vector3D(x, y, z, w); }
}
