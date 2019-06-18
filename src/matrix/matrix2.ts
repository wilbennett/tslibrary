import { DataMode, Matrix, MatrixData, MatrixValues } from '.';
import { Vector, Vector2D } from '../vectors';

export abstract class Matrix2 extends Matrix {
    private _temp: Float32Array;

    constructor(data: MatrixData) {
        super(data);

        this._temp = new Float32Array(6);
    }

    static get elementCount() { return 6; }
    get elementCount() { return 6; }

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
            py = py || 0;
        }

        this._translateData[0] = px;
        this._translateData[1] = py;
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
            py = py || 1;
        }

        this._scaleData[0] = px;
        this._scaleData[1] = py;
        return this;
    }

    setRotation2D(radians: number): this {
        this.dataMode = DataMode.fixed;
        this._data.isDirtyValues = true;
        this._rotateData[0] = radians;
        this._rotateData[1] = 0;
        this._rotateData[2] = 0;
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
            radiansY = radiansY || 0;
        }

        this._skewData[0] = radiansX;
        this._skewData[1] = radiansY;
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
            py = py || 0;
        }

        return this._translate(px, py);
    }

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
            py = py || 1;
        }

        return this._scale(px, py);
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
            radiansY = radiansY || 0;
        }

        return this._skew(radiansX, radiansY);
    }

    skewX(radians: number): this { return this._skew(radians, 0); }
    skewY(radians: number): this { return this._skew(0, radians); }

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
            values[1] * point.x + values[3] * point.y + values[5] * point.w);
    }

    calcInverse(values: MatrixValues, result: MatrixValues): MatrixValues | undefined {
        let det = values[0] * values[3] - values[1] * values[2];

        if (det === 0) return undefined;

        det = 1 / det;
        result[0] = values[3] * det;
        result[1] = -values[1] * det;
        result[2] = -values[2] * det;
        result[3] = values[0] * det;
        result[4] = (values[2] * values[5] - values[3] * values[4]) * det;
        result[5] = (values[1] * values[4] - values[0] * values[5]) * det;

        return result;
    }

    protected applyTranslation(data: MatrixValues, startIndex?: number): number {
        let index = startIndex || 0;
        const px = data[index++];
        const py = data[index++];
        this._translate(px, py);
        return index;
    }

    protected applyScale(data: MatrixValues, startIndex?: number): number {
        let index = startIndex || 0;
        const px = data[index++];
        const py = data[index++];
        this._scale(px, py);
        return 0;
    }

    protected applySkew(data: MatrixValues, startIndex?: number): number {
        let index = startIndex || 0;
        const px = data[index++];
        const py = data[index++];
        this._skew(px, py);
        return 0;
    }

    protected applyRotation(data: MatrixValues, startIndex?: number): number {
        let index = startIndex || 0;
        const radians = data[index++];
        const px = data[index++];
        const py = data[index++];
        this._rotate2D(radians, px, py);
        return 0;
    }


    // 0 2 4
    // 1 3 5
    protected _mult(a: MatrixValues, b: MatrixValues) {
        const temp = this._temp;
        temp.set(a);

        a[0] = temp[0] * b[0] + temp[2] * b[1];
        a[1] = temp[1] * b[0] + temp[3] * b[1];
        a[2] = temp[0] * b[2] + temp[2] * b[3];
        a[3] = temp[1] * b[2] + temp[3] * b[3];
        a[4] = temp[0] * b[4] + temp[2] * b[5] + temp[4];
        a[5] = temp[1] * b[4] + temp[3] * b[5] + temp[5];
    }

    protected _transformPoint(px: number, py: number, matrix: number[]) {
        return new Vector2D(
            matrix[0] * px + matrix[2] * py + matrix[4],
            matrix[1] * px + matrix[3] * py + matrix[5]);
    }

    protected _translate(dx: number, dy: number): this {
        const values = this.values;
        values[4] += values[0] * dx + values[2] * dy;
        values[5] += values[1] * dx + values[3] * dy;
        this.valuesUpdated();
        return this;
    }

    protected _scale(sx: number, sy: number): this {
        const values = this.values;
        values[0] *= sx;
        values[1] *= sx;
        values[2] *= sy;
        values[3] *= sy;
        this.valuesUpdated();
        return this;
    }

    protected _rotate2D(radians: number, centerX?: number, centerY?: number): this {
        centerX = centerX || 0;
        centerY = centerY || 0;
        const centered = centerX !== 0 || centerY !== 0;

        if (centered)
            this._translate(centerX, centerY);

        const values = this.values;
        const temp = this._temp;
        temp.set(values);
        const sin = Math.sin(radians);
        const cos = Math.cos(radians);

        values[0] = temp[0] * cos + temp[2] * sin;
        values[1] = temp[1] * cos + temp[3] * sin;
        values[2] = temp[0] * -sin + temp[2] * cos;
        values[3] = temp[1] * -sin + temp[3] * cos;

        if (centered)
            this._translate(-centerX, -centerY);

        this.valuesUpdated();
        return this;
    }

    protected _skew(radiansX: number, radiansY: number): this {
        const values = this.values;
        const values0 = values[0];
        const values1 = values[1];

        if (radiansX) {
            const tanX = Math.tan(radiansX);
            values[0] += values[2] * tanX;
            values[1] += values[3] * tanX;
        }

        if (radiansY) {
            const tanY = Math.tan(radiansY);
            values[2] += values0 * tanY;
            values[3] += values1 * tanY;
        }

        this.valuesUpdated();
        return this;
    }
}
