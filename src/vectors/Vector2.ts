import { Vector } from '.';

export class Vector2 extends Vector {
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
    protected set _mag(value) { this.__magSquared = value; }

    get magSquared() { return this.x * this.x + this.y * this.y; }
    get mag() { return Math.sqrt(this.x * this.x + this.y * this.y); }

    static get zeroPosition() { return new PVector2(0, 0); }
    static get zeroDirection() { return new DVector2(0, 0); }

    dot(other: Vector) { return this.x * other.x + this.y * other.y; }
    cross(other: Vector) { return this.x * other.y - this.y * other.x; }

    distanceSquared(other: Vector) {
        const deltaX = other.x - this.x;
        const deltaY = other.y - this.y;
        return deltaX * deltaX + deltaY * deltaY;
    }

    asCartesianO(result: Vector) { return result.set(this.x / this.w, this.y / this.w, 0, 1); }
    asPositionO(result: Vector) { return result.set(this.x, this.y, 0, 1); }
    asDirectionO(result: Vector) { return result.set(this.x, this.y, 0, 0); }
    displaceByO(other: Vector, result: Vector) {
        return result.set(this.x + other.x, this.y + other.y, 0, this.w);
    }
    addO(other: Vector, result: Vector) { return result.set(this.x + other.x, this.y + other.y, 0, this.w + other.w); }
    subO(other: Vector, result: Vector) { return result.set(this.x - other.x, this.y - other.y, 0, this.w - other.w); }
    scaleO(scale: number, result: Vector) { return result.set(this.x * scale, this.y * scale, 0, this.w); }
    addScaledO(other: Vector, scale: number, result: Vector) {
        return result.set(this.x + other.x * scale, this.y + other.y * scale, 0, this.w + other.w);
    }
    normalizeScaleO(scale: number, result: Vector) {
        const len = 1 / this.mag;
        return result.set(this.x * len * scale, this.y * len * scale, 0, this.w);
    }

    multO(other: Vector, result: Vector): Vector;
    multO(scaleX: number, result: Vector): Vector;
    multO(scaleX: number, scaleY: number, result: Vector): Vector;
    multO(scaleX: number, scaleY: number, scaleZ: number, result: Vector): Vector;
    multO(param1: Vector | number, param2?: any, param3?: any, param4?: Vector): Vector {
        let scaleX: number;
        let scaleY: number;
        let result: Vector;

        if (param1 instanceof Vector) {
            scaleX = param1.x;
            scaleY = param1.y;
            result = param2;
        } else if (arguments.length === 2) {
            scaleX = param1;
            scaleY = 1;
            result = param3!;
        } else if (arguments.length === 3) {
            scaleX = param1;
            scaleY = param2;
            result = param3!;
        } else {
            scaleX = param1;
            scaleY = param2;
            result = param4!;
        }

        return result.set(this.x * scaleX, this.y * scaleY, 0, this.w);
    }

    divO(scale: number, result: Vector) {
        scale = 1 / scale;
        return result.set(this.x * scale, this.y * scale, 0, this.w);
    }

    negateO(result: Vector) { return result.set(-this.x, -this.y, 0, this.w); }

    normalizeO(result: Vector) {
        const len = 1 / this.mag;
        return result.set(this.x * len, this.y * len, 0, this.w);
    }

    perpLeftO(result: Vector) { return result.set(-this.y, this.x, 0, this.w); }
    perpRightO(result: Vector) { return result.set(this.y, -this.x, 0, this.w); }

    toPixelsO(result: Vector, pixelsPerMeter: number = Vector.pixelsPerMeter) {
        return result.set(this.x * pixelsPerMeter, this.y * pixelsPerMeter, 0, this.w);
    }

    toMetersO(result: Vector, pixelsPerMeter: number = Vector.pixelsPerMeter) {
        const inverse = 1 / pixelsPerMeter;
        return result.set(this.x * inverse, this.y * inverse, 0, this.w);
    }

    equals(other: Vector, epsilon: number = Number.EPSILON) {
        if (this.isDirection && other.isDirection)
            return Math.abs(this.x - other.x) < epsilon && Math.abs(this.y - other.y) < epsilon;

        if (this.w === 1 && other.w === 1)
            return Math.abs(this.x - other.x) < epsilon && Math.abs(this.y - other.y) < epsilon;

        if (this.isDirection || other.isDirection)
            return false;

        if (this.w !== 1)
            return Math.abs(this.x / this.w - other.x) < epsilon && Math.abs(this.y / this.w - other.y) < epsilon;

        return Math.abs(this.x - other.x / other.w) < epsilon && Math.abs(this.y - other.y / other.w) < epsilon;
    }

    toString(precision: number = 2) {
        return this.isPosition
            ? `[${this.x.toFixed(precision)}, ${this.y.toFixed(precision)}, ${this.w.toFixed(precision)}]`
            : `<${this.x.toFixed(precision)}, ${this.y.toFixed(precision)}, ${this.w.toFixed(precision)}>`;
    }
}

export class PVector2 extends Vector2 {
    constructor(x: number = 0, y: number = 0) {
        super(x, y, 1);
    }

    static get [Symbol.species]() { return Vector2; }
}

export class DVector2 extends Vector2 {
    constructor(x: number = 0, y: number = 0) {
        super(x, y, 0);
    }

    static get [Symbol.species]() { return Vector2; }
}
