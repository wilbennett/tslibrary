import { Vector1, Vector1D, VectorData } from '.';

export class Vector1B extends Vector1 {
    protected _values: VectorData;
    protected _startIndex: number;

    constructor();
    constructor(values: VectorData, startIndex: number);
    constructor(x: number, values: VectorData, startIndex: number);
    constructor(param1?: any, param2?: any, param3?: any) {
        super();
        let x = 0;
        let values: VectorData;
        let startIndex = 0;

        switch (arguments.length) {
            case 0:
                values = new Array<number>(1);
                break;
            case 2:
                values = param1;
                startIndex = param2;
                break;
            default:
                x = param1!;
                values = param2;
                startIndex = param3;
                break;
        }

        this._values = values;
        this._startIndex = startIndex;
        this.x = x;
    }

    static get [Symbol.species]() { return Vector1D; }
    static get elementCount() { return 1; }
    get x() { return this._values[this._startIndex]; }
    set x(value) { this._values[this._startIndex] = value; }
}
