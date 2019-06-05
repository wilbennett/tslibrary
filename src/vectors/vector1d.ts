import { Vector1 } from '.';

// Used only to unify storage of values.  Some vector operations don't apply.
export class Vector1D extends Vector1 {
    constructor();
    constructor(x: number);
    constructor(x: number, y: number, z: number, w: number);
    // @ts-ignore - unused params.
    constructor(x?: number, y?: number, param3?: number, param4?: number) {
        super();
        this._x = x || 0;
    }

    static get elementCount() { return 1; }
    private _x: number;
    get x() { return this._x; }
    set x(value) { this._x = value; }
}
