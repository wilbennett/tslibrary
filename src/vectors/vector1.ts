import { Vector } from '.';

// Used only to unify storage of values.  Some vector operations don't apply.
export class Vector1 extends Vector {
    get magSquared() { return this.x * this.x; }
    get mag() { return Math.abs(this.x); }

    dot(other: Vector) { return this.x * other.x; }

    distanceSquared(other: Vector) {
        const deltaX = other.x - this.x;
        return deltaX * deltaX;
    }

    // TODO: Revisit.
    cross2D(other: Vector) { return this.x * other.x; }
    crossO(other: Vector, result: Vector) { return result.set(this.cross2D(other), 0, 0, 0); }
    asCartesianO(result: Vector) { return result.set(this.x, 0, 0, 0); }
    asPositionO(result: Vector) { return result.set(this.x, 0, 0, 0); }
    asDirectionO(result: Vector) { return result.set(this.x, 0, 0, 0); }
    displaceByO(other: Vector, result: Vector) { return result.set(this.x + other.x, 0, 0, 0); }
    addO(other: Vector, result: Vector) { return result.set(this.x + other.x, 0, 0, 0); }
    subO(other: Vector, result: Vector) { return result.set(this.x - other.x, 0, 0, 0); }
    scaleO(scale: number, result: Vector) { return result.set(this.x * scale, 0, 0, 0); }
    addScaledO(other: Vector, scale: number, result: Vector) { return result.set(this.x + other.x * scale, 0, 0, 0); }
    normalizeScaleO(scale: number, result: Vector) { return result.set(this.x / this.mag * scale, 0, 0, 0); }

    multO(other: Vector, result: Vector): Vector;
    multO(scaleX: number, result: Vector): Vector;
    multO(scaleX: number, scaleY: number, result: Vector): Vector;
    multO(scaleX: number, scaleY: number, scaleZ: number, result: Vector): Vector;
    multO(param1: Vector | number, param2?: any, param3?: any, param4?: Vector): Vector {
        let scaleX: number;
        let result: Vector;

        if (param1 instanceof Vector) {
            scaleX = param1.x;
            result = param2;
        } else if (arguments.length === 2) {
            scaleX = param1;
            result = param2!;
        } else if (arguments.length === 3) {
            scaleX = param1;
            result = param3!;
        } else {
            scaleX = param1;
            result = param4!;
        }

        return result.set(this.x * scaleX, 0, 0, 0);
    }

    divO(scale: number, result: Vector) { return result.set(this.x / scale, 0, 0, 0); }
    negateO(result: Vector) { return result.set(-this.x, 0, 0, 0); }
    normalizeO(result: Vector) { return result.set(this.x / this.mag, 0, 0, 0); }
    // TODO: Revisit.
    perpLeftO(result: Vector) { return result.set(-this.x, 0, 0, 0); }
    // TODO: Revisit.
    perpRightO(result: Vector) { return result.set(-this.x, 0, 0, 0); }

    toPixelsO(result: Vector, pixelsPerMeter: number = Vector.pixelsPerMeter) {
        return result.set(this.x * pixelsPerMeter, 0, 0, this.w);
    }

    toMetersO(result: Vector, pixelsPerMeter: number = Vector.pixelsPerMeter) {
        return result.set(this.x / pixelsPerMeter, 0, 0, this.w);
    }

    equals(other: Vector, epsilon: number = Number.EPSILON) { return Math.abs(this.x - other.x) < epsilon; }

    toString(precision: number = 2) { return `[${this.x.toFixed(precision)}]`; }
}
