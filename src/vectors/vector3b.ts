import { Vector3, Vector3D, VectorData } from '.';

export class Vector3B extends Vector3 {
    protected _values: VectorData;
    protected _startIndex: number;

    constructor();
    constructor(values: VectorData, startIndex: number);
    constructor(x: number, values: VectorData, startIndex: number);
    constructor(x: number, y: number, values: VectorData, startIndex: number);
    constructor(x: number, y: number, w: number, values: VectorData, startIndex: number);
    constructor(x: number, y: number, z: number, w: number, values: VectorData, startIndex: number);
    constructor(param1?: any, param2?: any, param3?: any, param4?: any, param5?: any, param6?: any) {
        super();
        let x = 0;
        let y = 0;
        let z = 0;
        let w = 0;
        let values: VectorData;
        let startIndex = 0;

        switch (arguments.length) {
            case 0:
                values = new Array<number>(4);
                break;
            case 2:
                values = param1;
                startIndex = param2;
                break;
            case 3:
                x = param1!;
                values = param2;
                startIndex = param3;
                break;
            case 4:
                x = param1!;
                y = param2;
                values = param3;
                startIndex = param4;
                break;
            case 5:
                x = param1!;
                y = param2;
                z = param3;
                values = param4;
                startIndex = param5;
                break;
            default:
                x = param1!;
                y = param2;
                z = param3;
                w = param4;
                values = param5;
                startIndex = param6;
                break;
        }

        this._values = values;
        this._startIndex = startIndex;
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }

    static get [Symbol.species]() { return Vector3D; }
    static get elementCount() { return 4; }
    get x() { return this._values[this._startIndex]; }
    set x(value) { this._values[this._startIndex] = value; }
    get y() { return this._values[this._startIndex + 1]; }
    set y(value) { this._values[this._startIndex + 1] = value; }
    get z() { return this._values[this._startIndex + 2]; }
    set z(value) { this._values[this._startIndex + 2] = value; }
    get w() { return this._values[this._startIndex + 3]; }
    set w(value) { this._values[this._startIndex + 3] = value; }
    private __magSquared?: number;
    protected get _magSquared(): number | undefined { return this.__magSquared; }
    protected set _magSquared(value) { this.__magSquared = value; }
    private __mag?: number;
    protected get _mag(): number | undefined { return this.__mag; }
    protected set _mag(value) { this.__magSquared = value; }
}
