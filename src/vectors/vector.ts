import { MathEx } from '../core';

export abstract class Vector {
    get x() { return 0; }
    // @ts-ignore - unused params.
    set x(value) { }
    get y() { return 0; }
    // @ts-ignore - unused params.
    set y(value) { }
    get w() { return 0; }
    // @ts-ignore - unused params.
    set w(value) { }
    get isPosition() { return this.w !== 0; }
    get isDirection() { return this.w === 0; }
    protected get _magSquared(): number | undefined { return undefined; }
    // @ts-ignore - unused params.
    protected set _magSquared(value) { }
    protected get _mag(): number | undefined { return undefined; }
    // @ts-ignore - unused params.
    protected set _mag(value) { }

    get magSquared() { return this.x * this.x + this.y * this.y; }
    get mag() { return Math.sqrt(this.x * this.x + this.y * this.y); }
    get normal() { return this.perp(); }

    get radians() {
        const res = Math.atan2(this.y, this.x);
        return res >= 0 ? res : res + 2 * Math.PI;
    }

    get degrees() { return this.radians * MathEx.ONE_DEGREE; }

    static pixelsPerMeter = 30;
    static get zeroPosition() { return new PVector(0, 0); }
    static get zeroDirection() { return new DVector(0, 0); }
    static get [Symbol.species]() { return this; }

    newVector(x: number = 0, y: number = 0, w: number = 1) {
        // @ts-ignore - species pattern.
        const Species = this.constructor[Symbol.species];
        return new Species(x, y, w);
    }

    set(x: number, y: number, w: number = 1) {
        this.x = x;
        this.y = y;
        this.w = w;
        return this.clear(this);
    }

    copyFrom(other: Vector) { return this.set(other.x, other.y, other.w); }
    copyTo(other: Vector) { other.set(this.x, this.y, this.w); return this; }
    clone() { return this.newVector(this.x, this.y, this.w); }

    dot(other: Vector) { return this.x * other.x + this.y * other.y; }
    cross(other: Vector) { return this.x * other.y - this.y * other.x; }

    distanceSquared(other: Vector) {
        const deltaX = other.x - this.x;
        const deltaY = other.y - this.y;
        return deltaX * deltaX + deltaY * deltaY;
    }

    distance(other: Vector) { return Math.sqrt(this.distanceSquared(other)); }

    asCartesianO(result: Vector) { return result.set(this.x / this.w, this.y / this.w, 1); }
    asCartesianN() { return this.asCartesianO(this.newVector()); }
    asCartesian() { return this.asCartesianO(this); }

    asPositionO(result: Vector) { return result.set(this.x, this.y, 1); }
    asPositionN() { return this.asPositionO(this.newVector()); }
    asPosition() { return this.asPositionO(this); }

    asDirectionO(result: Vector) { return result.set(this.x, this.y, 0); }
    asDirectionN() { return this.asDirectionO(this.newVector()); }
    asDirection() { return this.asDirectionO(this); }

    displaceByO(other: Vector, result: Vector) {
        return result.set(this.x + other.x, this.y + other.y, this.w);
    }
    displaceByN(other: Vector) { return this.displaceByO(other, this.newVector()); }
    displaceBy(other: Vector) { return this.displaceByO(other, this); }

    addO(other: Vector, result: Vector) { return result.set(this.x + other.x, this.y + other.y, this.w + other.w); }
    addN(other: Vector) { return this.addO(other, this.newVector()); }
    add(other: Vector) { return this.addO(other, this); }

    subO(other: Vector, result: Vector) { return result.set(this.x - other.x, this.y - other.y, this.w - other.w); }
    subN(other: Vector) { return this.subO(other, this.newVector()); }
    sub(other: Vector) { return this.subO(other, this); }

    scaleO(scale: number, result: Vector) { return result.set(this.x * scale, this.y * scale, this.w); }
    scaleN(scale: number) { return this.scaleO(scale, this.newVector()); }
    scale(scale: number) { return this.scaleO(scale, this); }

    addScaledO(other: Vector, scale: number, result: Vector) {
        return result.set(this.x + other.x * scale, this.y + other.y * scale, this.w + other.w);
    }
    addScaledN(other: Vector, scale: number) { return this.addScaledO(other, scale, this.newVector()); }
    addScaled(other: Vector, scale: number) { return this.addScaledO(other, scale, this); }

    normalizeScaleO(scale: number, result: Vector) {
        const len = 1 / this.mag;
        return result.set(this.x * len * scale, this.y * len * scale, this.w);
    }
    normalizeScaleN(scale: number) { return this.normalizeScaleO(scale, this.newVector()); }
    normalizeScale(scale: number) { return this.normalizeScaleO(scale, this); }

    multO(other: Vector, result: Vector): Vector;
    multO(scaleX: number, scaleY: number, result: Vector): Vector;
    multO(param1: Vector | number, param2?: any, param3?: Vector): Vector {
        let scaleX: number;
        let scaleY: number;
        let result: Vector;

        if (param1 instanceof Vector) {
            scaleX = param1.x;
            scaleY = param1.y;
            result = param2;
        } else {
            scaleX = param1;
            scaleY = param2;
            result = param3!;
        }

        return result.set(this.x * scaleX, this.y * scaleY, this.w);
    }
    multN(other: Vector): Vector;
    multN(scaleX: number, scaleY: number): Vector;
    multN(param1: Vector | number, scaleY?: number): Vector {
        return param1 instanceof Vector
            ? this.multO(param1, this.newVector())
            : this.multO(param1, scaleY!, this.newVector());
    }
    mult(other: Vector): Vector;
    mult(scaleX: number, scaleY: number): Vector;
    mult(param1: Vector | number, scaleY?: number): Vector {
        return param1 instanceof Vector
            ? this.multO(param1, this)
            : this.multO(param1, scaleY!, this);
    }

    divO(scale: number, result: Vector) {
        scale = 1 / scale;
        return result.set(this.x * scale, this.y * scale, this.w);
    }
    divN(scale: number) { return this.divO(scale, this.newVector()); }
    div(scale: number) { return this.divO(scale, this); }

    negateO(result: Vector) { return result.set(-this.x, -this.y, this.w); }
    negateN() { return this.negateO(this.newVector()); }
    negate() { return this.negateO(this); }

    normalizeO(result: Vector) {
        const len = 1 / this.mag;
        return result.set(this.x * len, this.y * len, this.w);
    }
    normalizeN() { return this.normalizeO(this.newVector()); }
    normalize() { return this.normalizeO(this); }

    rotateO(radians: number, result: Vector) {
        const sin = Math.sin(radians);
        const cos = Math.cos(radians);
        const x = this.x;
        const y = this.y;

        return result.set(x * cos - y * sin, x * sin + y * cos, this.w);
    }
    rotateN(radians: number) { return this.rotateO(radians, this.newVector()); }
    rotate(radians: number) { return this.rotateO(radians, this); }

    rotateAboutO(center: Vector, radians: number, result: Vector) {
        const sin = Math.sin(radians);
        const cos = Math.cos(radians);
        let x = this.x - center.x;
        let y = this.y - center.y;
        let rx = x * cos - y * sin;
        let ry = x * sin + y * cos;
        rx += center.x;
        ry += center.y;

        return result.set(rx, ry, this.w);
    }
    rotateAboutN(center: Vector, radians: number) { return this.rotateAboutO(center, radians, this.newVector()); }
    rotateAbout(center: Vector, radians: number) { return this.rotateAboutO(center, radians, this); }

    rotateOneDegreeO(result: Vector) {
        const x = this.x;
        const y = this.y;
        return result.set(x * MathEx.COS1 - y * MathEx.SIN1, x * MathEx.SIN1 + y * MathEx.COS1, this.w);
    }
    rotateOneDegreeN() { return this.rotateOneDegreeO(this.newVector()); }
    rotateOneDegree() { return this.rotateOneDegreeO(this); }

    rotateNegativeOneDegreeO(result: Vector) {
        const x = this.x;
        const y = this.y;
        return result.set(x * MathEx.COSN1 - y * MathEx.SINN1, x * MathEx.SINN1 + y * MathEx.COSN1, this.w);
    }
    rotateNegativeOneDegreeN() { return this.rotateNegativeOneDegreeO(this.newVector()); }
    rotateNegativeOneDegree() { return this.rotateNegativeOneDegreeO(this); }

    perpLeftO(result: Vector) { return result.set(-this.y, this.x, this.w); }
    perpLeftN() { return this.perpLeftO(this.newVector()); }
    perpLeft() { return this.perpLeftO(this); }

    perpRightO(result: Vector) { return result.set(this.y, -this.x, this.w); }
    perpRightN() { return this.perpRightO(this.newVector()); }
    perpRight() { return this.perpRightO(this); }

    perpO = this.perpLeftO;
    perpN = this.perpLeftN;
    perp = this.perpLeft;

    projectionLength(other: Vector) { return this.dot(other) / other.dot(other); }

    projectOntoUnitO(unitVector: Vector, result: Vector) { return unitVector.scaleO(this.dot(unitVector), result); }
    projectOntoUnitN(unitVector: Vector) { return this.projectOntoUnitO(unitVector, this.newVector()); }
    projectOntoUnit(unitVector: Vector) { return this.projectOntoUnitO(unitVector, this); }

    projectOntoO(other: Vector, result: Vector) { return other.scaleO(this.dot(other) / other.dot(other), result); }
    projectOntoN(other: Vector) { return this.projectOntoO(other, this.newVector()); }
    projectOnto(other: Vector) { return this.projectOntoO(other, this); }

    reflectViaNormalO(normal: Vector, result: Vector) {
        // -(2 * (v . normal) * normal - v)
        let dot2 = 2 * this.dot(normal);
        let dot2TimesNormal = normal.scaleN(dot2);
        return result.copyFrom(dot2TimesNormal.sub(this).negate());

        // v - 2 * (v . normal) * normal
        // return result.copyFrom(this.sub(dot2TimesNormal));
    }
    reflectViaNormalN(normal: Vector) { return this.reflectViaNormalO(normal, this.newVector()); }
    reflectViaNormal(normal: Vector) { return this.reflectViaNormalO(normal, this); }

    reflectOffO(reflector: Vector, result: Vector): Vector { return this.reflectViaNormalO(reflector.normal, result); }
    reflectOffN(reflector: Vector): Vector { return this.reflectOffO(reflector, this.newVector()); }
    reflectOff(reflector: Vector): Vector { return this.reflectOffO(reflector, this); }

    reflectO(source: Vector, result: Vector): Vector { return source.reflectViaNormalO(this.normal, result); }
    reflectN(source: Vector): Vector { return this.reflectO(source, this.newVector()); }
    reflect(source: Vector): Vector { return this.reflectO(source, this); }

    radiansBetween(target: Vector): number {
        const result = Math.atan2(this.x * target.y - this.y * target.x, this.x * target.x + this.y * target.y);
        return result > 0 ? result : result + MathEx.TWO_PI;
    }

    toPixelsO(result: Vector, pixelsPerMeter: number = Vector.pixelsPerMeter) {
        return result.set(this.x * pixelsPerMeter, this.y * pixelsPerMeter, this.w);
    }
    toPixelsN(pixelsPerMeter: number = Vector.pixelsPerMeter) {
        return this.toPixelsO(this.newVector(), pixelsPerMeter);
    }
    toPixels(pixelsPerMeter: number = Vector.pixelsPerMeter) { return this.toPixelsO(this, pixelsPerMeter); }

    toMetersO(result: Vector, pixelsPerMeter: number = Vector.pixelsPerMeter) {
        return result.set(this.x / pixelsPerMeter, this.y / pixelsPerMeter, this.w);
    }
    toMetersN(pixelsPerMeter: number = Vector.pixelsPerMeter) {
        return this.toMetersO(this.newVector(), pixelsPerMeter);
    }
    toMeters(pixelsPerMeter: number = Vector.pixelsPerMeter) { return this.toMetersO(this, pixelsPerMeter); }

    withXYWO(x: number, y: number, w: number, result: Vector) { return result.set(x, y, w); }
    withXYWN(x: number, y: number, w: number) { return this.withXYWO(x, y, w, this.newVector()); }
    withXYW(x: number, y: number, w: number) { return this.withXYWO(x, y, w, this); }

    withXYO(x: number, y: number, result: Vector) { return result.set(x, y, this.w); }
    withXYN(x: number, y: number) { return this.withXYO(x, y, this.newVector()); }
    withXY(x: number, y: number) { return this.withXYO(x, y, this); }

    withXO(x: number, result: Vector) { return result.set(x, this.y, this.w); }
    withXN(x: number) { return this.withXO(x, this.newVector()); }
    withX(x: number) { return this.withXO(x, this); }

    withYO(y: number, result: Vector) { return result.set(this.x, y, this.w); }
    withYN(y: number) { return this.withYO(y, this.newVector()); }
    withY(y: number) { return this.withYO(y, this); }

    withWO(w: number, result: Vector) { return result.set(this.x, this.y, w); }
    withWN(w: number) { return this.withWO(w, this.newVector()); }
    withW(w: number) { return this.withWO(w, this); }

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

    draw(ctx: CanvasRenderingContext2D, radius: number) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
        ctx.fill();
    }

    toString(precision: number = 2) {
        return this.isPosition
            ? `[${this.x.toFixed(precision)}, ${this.y.toFixed(precision)}, ${this.w.toFixed(precision)}]`
            : `<${this.x.toFixed(precision)}, ${this.y.toFixed(precision)}, ${this.w.toFixed(precision)}>`;
    }

    static fromRadians(angle: number, radius: number = 1) {
        return new Vector2(Math.cos(angle), Math.sin(angle)).scale(radius);
    }

    static fromDegrees(angle: number, mag: number = 1) { return this.fromRadians(angle * MathEx.ONE_RADIAN, mag); }

    protected clear(instance: Vector) {
        if (instance._magSquared !== undefined)
            instance._magSquared = undefined;

        if (instance._mag !== undefined)
            instance._mag = undefined;

        return instance;
    }
}


export class Vector2 extends Vector {
    constructor(x: number = 0, y: number = 0, w: number = 0) {
        super();

        this._x = x;
        this._y = y;
        this._w = w;
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
}

export class PVector extends Vector2 {
    constructor(x: number = 0, y: number = 0) {
        super(x, y, 1);
    }

    static get [Symbol.species]() { return Vector2; }
}

export class DVector extends Vector2 {
    constructor(x: number = 0, y: number = 0) {
        super(x, y, 0);
    }

    static get [Symbol.species]() { return Vector2; }
}
