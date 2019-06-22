import { DataMode, Matrix, MatrixData, MatrixValues } from '.';
import { Vector, Vector2D } from '../vectors';

export interface Matrix2Constructor {
    new(): Matrix2;
}

export abstract class Matrix2 extends Matrix {
    constructor(data: MatrixData) {
        super(data);
    }

    private static _instanceConstructor: Matrix2Constructor;
    static get instanceConstructor() { return this._instanceConstructor; }
    static set instanceConstructor(value: Matrix2Constructor) { this._instanceConstructor = value; }

    private static _instance: Matrix2;
    static get instance() { return this._instance || (this._instance = this.create()); }
    static set instance(value: Matrix2) { this._instance = value; }

    static get elementCount() { return 6; }
    get elementCount() { return 6; }
    static create() { return new this.instanceConstructor(); }

    protected get translateBufferLength() { return 2; }
    protected get rotateBufferLength() { return 3; }
    protected get skewBufferLength() { return 2; }
    protected get scaleBufferLength() { return 2; }

    setTranslation(value: Vector): this;
    setTranslation(px: number, py: number, pz?: number): this;
    // @ts-ignore - unused param.
    setTranslation(param1: Vector | number, py?: number, pz?: number): this {
        this.dataMode = DataMode.fixed;
        this._data.isDirtyValues = true;
        let px = 0;

        if (param1 instanceof Vector) {
            px = param1.x;
            py = param1.y;
        } else {
            px = param1;
            py = py!;
        }

        const buffer = this._buffer;
        let index = this.getNextDataStart(Matrix.BUFFER_TRANSLATE, 0);
        buffer[index++] = px;
        buffer[index] = py;
        return this;
    }

    setRotation2D(radians: number): this {
        this.dataMode = DataMode.fixed;
        this._data.isDirtyValues = true;
        const buffer = this._buffer;
        let index = this.getNextDataStart(Matrix.BUFFER_ROTATE, 0);
        buffer[index++] = radians;
        buffer[index++] = 0;
        buffer[index] = 0;
        return this;
    }

    setSkew(value: Vector): this;
    setSkew(radiansX: number, radiansY: number, radiansZ?: number): this;
    // @ts-ignore - unused param.
    setSkew(param1: Vector | number, radiansY?: number, radiansZ?: number): this {
        this.dataMode = DataMode.fixed;
        this._data.isDirtyValues = true;
        let radiansX = 0;

        if (param1 instanceof Vector) {
            radiansX = param1.x;
            radiansY = param1.y;
        } else {
            radiansX = param1;
            radiansY = radiansY!;
        }

        const buffer = this._buffer;
        let index = this.getNextDataStart(Matrix.BUFFER_SKEW, 0);
        buffer[index++] = radiansX;
        buffer[index] = radiansY;
        return this;
    }

    setScale(value: Vector): this;
    setScale(value: number): this;
    setScale(px: number, py: number, pz?: number): this;
    // @ts-ignore - unused param.
    setScale(param1: Vector | number, py?: number, pz?: number): this {
        this.dataMode = DataMode.fixed;
        this._data.isDirtyValues = true;
        let px = 0;

        if (param1 instanceof Vector) {
            px = param1.x;
            py = param1.y;
        } else if (arguments.length === 1) {
            px = param1;
            py = param1;
        } else {
            px = param1;
            py = py!;
        }

        const buffer = this._buffer;
        let index = this.getNextDataStart(Matrix.BUFFER_SCALE, 0);
        buffer[index++] = px;
        buffer[index] = py;
        return this;
    }

    translate(value: Vector): this;
    translate(px: number, py: number, pz?: number): this;
    // @ts-ignore - unused param.
    translate(param1: Vector | number, py?: number, pz?: number): this {
        this.dataMode = DataMode.dynamic;
        let px = 0;

        if (param1 instanceof Vector) {
            px = param1.x;
            py = param1.y;
        } else {
            px = param1;
            py = py!;
        }

        return this._translate(px, py);
    }

    rotate2D(radians: number): this;
    rotate2D(radians: number, center: Vector): this;
    rotate2D(radians: number, centerX: number, centerY: number): this;
    rotate2D(radians: number, param2?: Vector | number, centerY?: number): this {
        this.dataMode = DataMode.dynamic;
        let centerX: number | undefined;

        if (param2 instanceof Vector) {
            centerX = param2.x;
            centerY = param2.y;
        } else {
            centerX = param2;
        }

        return this._rotate2D(radians, centerX, centerY);
    }

    skew(value: Vector): this;
    skew(radiansX: number, radiansY: number, radiansZ?: number): this;
    // @ts-ignore - unused param.
    skew(param1: Vector | number, radiansY?: number, radiansZ?: number): this {
        this.dataMode = DataMode.dynamic;
        let radiansX = 0;

        if (param1 instanceof Vector) {
            radiansX = param1.x;
            radiansY = param1.y;
        } else {
            radiansX = param1;
            radiansY = radiansY!;
        }

        return this._skew(radiansX, radiansY);
    }

    skewX(radians: number): this { return this._skew(radians, 0); }
    skewY(radians: number): this { return this._skew(0, radians); }

    scale(value: Vector): this;
    scale(value: number): this;
    scale(px: number, py: number, pz?: number): this;
    // @ts-ignore - unused param.
    scale(param1: Vector | number, py?: number, pz?: number): this {
        this.dataMode = DataMode.dynamic;
        let px = 0;

        if (param1 instanceof Vector) {
            px = param1.x;
            py = param1.y;
        } else if (arguments.length === 1) {
            px = param1;
            py = param1;
        } else {
            px = param1;
            py = py!;
        }

        return this._scale(px, py);
    }

    mult(values: MatrixValues): this;
    mult(values1: MatrixValues, values2: MatrixValues): MatrixValues;
    mult(param1: MatrixValues, values2?: MatrixValues): MatrixValues | this {
        if (!values2) {
            this.dataMode = DataMode.dynamic;
            this._mult(this.values, param1);
            return this;
        }

        this._mult(param1, values2);
        return param1;
    }

    transform(point: Vector, values?: MatrixValues): Vector {
        values = values || this.values;

        return new Vector2D(
            values[0] * point.x + values[2] * point.y + values[4] * point.w,
            values[1] * point.x + values[3] * point.y + values[5] * point.w,
            point.w);
    }

    calcInverse(values: MatrixValues, result: MatrixValues): MatrixValues | undefined {
        const value0 = values[0];
        const value1 = values[1];
        const value2 = values[2];
        const value3 = values[3];
        const value4 = values[4];
        const value5 = values[5];
        let det = value0 * value3 - value1 * value2;

        if (det === 0) return undefined;

        det = 1 / det;
        result[0] = value3 * det;
        result[1] = -value1 * det;
        result[2] = -value2 * det;
        result[3] = value0 * det;
        result[4] = (value2 * value5 - value3 * value4) * det;
        result[5] = (value1 * value4 - value0 * value5) * det;

        return result;
    }

    protected writeTranslation(buffer: MatrixValues, index: number, px?: number, py?: number) {
        buffer[index++] = px || 0;
        buffer[index++] = py || 0;
        return index;
    }

    protected writeRotation2D(buffer: MatrixValues, index: number, radians?: number, centerX?: number, centerY?: number) {
        buffer[index++] = radians || 0;
        buffer[index++] = centerX || 0;
        buffer[index++] = centerY || 0;
        return index;
    }

    protected writeSkew(buffer: MatrixValues, index: number, radiansX?: number, radiansY?: number) {
        buffer[index++] = radiansX || 0;
        buffer[index++] = radiansY || 0;
        return index;
    }

    protected writeScale(buffer: MatrixValues, index: number, sx?: number, sy?: number) {
        buffer[index++] = sx || 0;
        buffer[index++] = sy || 0;
        return index;
    }

    protected applyTranslation(data: MatrixValues, index: number): number {
        const px = data[index++];
        const py = data[index++];
        this._translate(px, py);
        return index;
    }

    protected applyRotation(data: MatrixValues, index: number): number {
        const radians = data[index++];
        const px = data[index++];
        const py = data[index++];
        this._rotate2D(radians, px, py);
        return index;
    }

    protected applySkew(data: MatrixValues, index: number): number {
        const px = data[index++];
        const py = data[index++];
        this._skew(px, py);
        return index;
    }

    protected applyScale(data: MatrixValues, index: number): number {
        const px = data[index++];
        const py = data[index++];
        this._scale(px, py);
        return index;
    }

    // 0 2 4
    // 1 3 5
    protected _mult(a: MatrixValues, b: MatrixValues) {
        // const temp = this._temp;
        // temp.set(a);
        const a0 = a[0];
        const a1 = a[1];
        const a2 = a[2];
        const a3 = a[3];
        const a4 = a[4];
        const a5 = a[5];

        a[0] = a0 * b[0] + a2 * b[1];
        a[1] = a1 * b[0] + a3 * b[1];
        a[2] = a0 * b[2] + a2 * b[3];
        a[3] = a1 * b[2] + a3 * b[3];
        a[4] = a0 * b[4] + a2 * b[5] + a4;
        a[5] = a1 * b[4] + a3 * b[5] + a5;
    }

    protected _translate(dx: number, dy: number): this {
        if (dx === 0 && dy === 0) return this;

        const values = this.values;
        values[4] += values[0] * dx + values[2] * dy;
        values[5] += values[1] * dx + values[3] * dy;
        this.valuesUpdated();
        return this;
    }

    protected _rotate2D(radians: number, centerX?: number, centerY?: number): this {
        if (radians === 0) return this;

        centerX = centerX || 0;
        centerY = centerY || 0;
        const centered = centerX !== 0 || centerY !== 0;

        if (centered)
            this._translate(centerX, centerY);

        const values = this.values;
        const value0 = values[0];
        const value1 = values[1];
        const value2 = values[2];
        const value3 = values[3];

        const sin = Math.sin(radians);
        const cos = Math.cos(radians);

        values[0] = value0 * cos + value2 * sin;
        values[1] = value1 * cos + value3 * sin;
        values[2] = value0 * -sin + value2 * cos;
        values[3] = value1 * -sin + value3 * cos;

        if (centered)
            this._translate(-centerX, -centerY);

        this.valuesUpdated();
        return this;
    }

    protected _skew(radiansX: number, radiansY: number): this {
        if (radiansX === 0 && radiansY === 0) return this;

        const values = this.values;
        const values0 = values[0];
        const values1 = values[1];

        if (radiansY) {
            const tanY = Math.tan(radiansY);
            values[0] += values[2] * tanY;
            values[1] += values[3] * tanY;
        }

        if (radiansX) {
            const tanX = Math.tan(radiansX);
            values[2] += values0 * tanX;
            values[3] += values1 * tanX;
        }

        this.valuesUpdated();
        return this;
    }

    protected _scale(sx: number, sy: number): this {
        if (sx === 0 && sy === 0) return this;

        const values = this.values;
        values[0] *= sx;
        values[1] *= sx;
        values[2] *= sy;
        values[3] *= sy;
        this.valuesUpdated();
        return this;
    }
}
