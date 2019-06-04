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
    cross(other: Vector) { return 0; }
    // @ts-ignore - unused param.
    distanceSquared(other: Vector) { return 0; }
    // @ts-ignore - unused param.
    asCartesianO(result: Vector) { return result.set(0, 0, 0, 0); }
    // @ts-ignore - unused param.
    asPositionO(result: Vector) { return result.set(0, 0, 0, 0); }
    // @ts-ignore - unused param.
    asDirectionO(result: Vector) { return result.set(0, 0, 0, 0); }
    // @ts-ignore - unused param.
    displaceByO(other: Vector, result: Vector) { return result.set(0, 0, 0, 0); }
    // @ts-ignore - unused param.
    addO(other: Vector, result: Vector) { return result.set(0, 0, 0, 0); }
    // @ts-ignore - unused param.
    subO(other: Vector, result: Vector) { return result.set(0, 0, 0, 0); }
    // @ts-ignore - unused param.
    scaleO(scale: number, result: Vector) { return result.set(0, 0, 0, 0); }
    // @ts-ignore - unused param.
    addScaledO(other: Vector, scale: number, result: Vector) { return result.set(0, 0, 0, 0); }
    // @ts-ignore - unused param.
    normalizeScaleO(scale: number, result: Vector) { return result.set(0, 0, 0, 0); }

    multO(other: Vector, result: Vector): Vector;
    multO(scaleX: number, result: Vector): Vector;
    multO(scaleX: number, scaleY: number, result: Vector): Vector;
    multO(scaleX: number, scaleY: number, scaleZ: number, result: Vector): Vector;
    multO(param1: Vector | number, param2?: any, param3?: any, param4?: Vector): Vector {
        let result: Vector;

        if (param1 instanceof Vector) {
            result = param2;
        } else if (arguments.length === 2) {
            result = param3!;
        } else if (arguments.length === 3) {
            result = param3!;
        } else {
            result = param4!;
        }

        return result.set(0, 0, 0, 0);
    }

    // @ts-ignore - unused param.
    divO(scale: number, result: Vector) { return result.set(0, 0, 0, 0); }
    negateO(result: Vector) { return result.set(0, 0, 0, 0); }
    normalizeO(result: Vector) { return result.set(0, 0, 0, 0); }
    perpLeftO(result: Vector) { return result.set(0, 0, 0, 0); }
    perpRightO(result: Vector) { return result.set(0, 0, 0, 0); }
    // @ts-ignore - unused param.
    toPixelsO(result: Vector, pixelsPerMeter: number = Vector.pixelsPerMeter) { return result.set(0, 0, 0, 0); }
    // @ts-ignore - unused param.
    toMetersO(result: Vector, pixelsPerMeter: number = Vector.pixelsPerMeter) { return result.set(0, 0, 0, 0); }
    // @ts-ignore - unused param.
    equals(other: Vector, epsilon: number = Number.EPSILON) { return other instanceof NullVector; }

    toString(precision: number = 2) {
        return `[${this.x.toFixed(precision)}, ${this.y.toFixed(precision)}, ${this.w.toFixed(precision)}]`;
    }
}
