import { Vector2Base } from '.';
import { MathEx } from '../core';

export class Vector2 extends Vector2Base {
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

    static get zeroPosition() { return new PVector2(0, 0); }
    static get zeroDirection() { return new DVector2(0, 0); }

    static fromRadians(angle: number, radius: number = 1) {
        return new Vector2(Math.cos(angle), Math.sin(angle)).scale(radius);
    }

    static fromDegrees(angle: number, mag: number = 1) { return this.fromRadians(angle * MathEx.ONE_RADIAN, mag); }
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
