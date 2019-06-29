import { Vector } from '.';

export interface Vector3Constructor {
    new(x: number, y: number, z: number, w?: number): Vector3;
}

export class Vector3 extends Vector {
    private static _instanceConstructor3: Vector3Constructor;
    static get instanceConstructor() { return this._instanceConstructor3; }
    static set instanceConstructor(value: Vector3Constructor) { this._instanceConstructor3 = value; }

    static create(x: number, y: number, z: number, w: number = 0) { return new this.instanceConstructor(x, y, z, w); }
    static createPosition(x: number, y: number, z: number) { return new this.instanceConstructor(x, y, z, 1); }
    static createDirection(x: number, y: number, z: number) { return new this.instanceConstructor(x, y, z, 0); }
}
