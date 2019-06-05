import { Vector2, Vector2Base } from '.';

export class Vector2F32 extends Vector2Base {
    protected _values: Float32Array;
    protected _startIndex: number;

    constructor();
    constructor(values: Float32Array, startIndex: number);
    constructor(x: number, values: Float32Array, startIndex: number);
    constructor(x: number, y: number, values: Float32Array, startIndex: number);
    constructor(x: number, y: number, w: number, values: Float32Array, startIndex: number);
    constructor(param1?: any, param2?: any, param3?: any, param4?: any, param5?: any) {
        super();
        let x = 0;
        let y = 0;
        let w = 0;
        let values: Float32Array;
        let startIndex = 0;

        switch (arguments.length) {
            case 0:
                values = new Float32Array(3);
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
            default:
                x = param1!;
                y = param2;
                w = param3;
                values = param4;
                startIndex = param5;
                break;
        }

        this._values = values;
        this._startIndex = startIndex;
        this.x = x;
        this.y = y;
        this.w = w;
    }

    static get [Symbol.species]() { return Vector2; }
    static get elementCount() { return 3; }
    get x() { return this._values[this._startIndex]; }
    set x(value) { this._values[this._startIndex] = value; }
    get y() { return this._values[this._startIndex + 1]; }
    set y(value) { this._values[this._startIndex + 1] = value; }
    get w() { return this._values[this._startIndex + 2]; }
    set w(value) { this._values[this._startIndex + 2] = value; }
    private __magSquared?: number;
    protected get _magSquared(): number | undefined { return this.__magSquared; }
    protected set _magSquared(value) { this.__magSquared = value; }
    private __mag?: number;
    protected get _mag(): number | undefined { return this.__mag; }
    protected set _mag(value) { this.__magSquared = value; }
}
