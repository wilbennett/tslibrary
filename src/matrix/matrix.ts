import { MatrixValues } from '.';
import { MathEx } from '../core';
import { Vector } from '../vectors';

export const enum MatrixFlags {
    none = 0,
    valuesDirty = 1 << 0,
    inverseDirty = 1 << 1,
    inverseValid = 1 << 2
}

export const enum DataMode {
    fixed,
    dynamic
}

export class MatrixData {
    constructor(public values: MatrixValues, public inverse: MatrixValues) {
    }

    flags: MatrixFlags = MatrixFlags.none;

    get isDirtyValues() { return (this.flags & MatrixFlags.valuesDirty) !== 0; }
    set isDirtyValues(value) { this.updateFlag(MatrixFlags.valuesDirty, value); }
    get isDirtyInverse() { return (this.flags & MatrixFlags.inverseDirty) !== 0; }
    set isDirtyInverse(value) { this.updateFlag(MatrixFlags.inverseDirty, value); }
    get isInverseValid() { return (this.flags & MatrixFlags.inverseValid) !== 0; }
    set isInverseValid(value) { this.updateFlag(MatrixFlags.inverseValid, value); }

    protected updateFlag(flag: MatrixFlags, value: boolean) {
        if (value)
            this.flags |= flag;
        else
            this.flags &= ~flag;
    }
}

export function copy(source: MatrixValues, result: MatrixValues) {
    if (Array.isArray(result)) {
        if (Array.isArray(source)) {
            result.splice(0, source.length, ...source);
        } else {
            source.forEach((v, i) => result[i] = v);
        }
    } else {
        result.set(source);
    }

    return result;
}

const BUFFER_END = -1;
const BUFFER_TRANSLATE = 1;
const BUFFER_ROTATE = 2;
const BUFFER_SKEW = 3;
const BUFFER_SCALE = 4;
const BUFFER_TRANSFORM = 4;

export abstract class Matrix {
    protected static readonly BUFFER_END = -BUFFER_END;
    protected static readonly BUFFER_TRANSLATE = BUFFER_TRANSLATE;
    protected static readonly BUFFER_ROTATE = BUFFER_ROTATE;
    protected static readonly BUFFER_SKEW = BUFFER_SKEW;
    protected static readonly BUFFER_SCALE = BUFFER_SCALE;
    protected static readonly BUFFER_TRANSFORM = BUFFER_TRANSFORM;

    protected _data: MatrixData;
    protected _buffer: MatrixValues;
    protected _bufferIndex: number;
    protected _stack: MatrixData[] = [];

    constructor(data: MatrixData) {
        this._data = data;

        this._buffer = new Array<number>(Matrix.bufferSize);
        this._bufferIndex = 0;
    }

    private static _bufferSize: number;
    static get bufferSize() { return this._bufferSize; }
    static set bufferSize(value) { this._bufferSize = Math.max(value, 255); }

    abstract get elementCount(): number;

    protected get isBufferEmpty() { return this._bufferIndex === 0 && this._buffer[this._bufferIndex] === BUFFER_END; }
    protected abstract get translateBufferLength(): number;
    protected abstract get rotateBufferLength(): number;
    protected abstract get skewBufferLength(): number;
    protected abstract get scaleBufferLength(): number;

    get values() {
        if (this._data.isDirtyValues)
            this.updateValues();

        return this._data.values;
    }

    get inverse(): MatrixValues {
        if (this._data.isDirtyInverse)
            this.updateInverse();

        return this._data.inverse;
    }

    get isInverseValid() {
        if (this._data.isDirtyInverse)
            this.updateInverse();

        return this._data.isInverseValid;
    }

    private _dataMode: DataMode = DataMode.fixed;
    protected get dataMode() { return this._dataMode; }
    protected set dataMode(value) {
        if (value === this._dataMode) return;

        if (value === DataMode.fixed) {
            this.initializeFixedBuffer();
            this._data.isDirtyInverse = true;
            this._data.isInverseValid = false;
        }

        this._dataMode = value;
    }

    abstract createValues(): MatrixValues;
    abstract getIdentity(result: MatrixValues): MatrixValues;
    createIdentity() { return this.getIdentity(this.createValues()); }
    getValues(result: MatrixValues): MatrixValues { return copy(this.values, result); }
    getInverse(result: MatrixValues): MatrixValues { return copy(this.inverse, result); }

    setToIdentity() {
        this.getIdentity(this.values);
        this.getIdentity(this.inverse);
        this._data.isDirtyValues = false;
        this._data.isDirtyInverse = false;
        this._data.isInverseValid = true;
        this.initializeFixedBuffer();
        this.dataMode = DataMode.fixed;
        return this;
    }

    reset() {
        this._data = new MatrixData(this.createValues(), this.createValues());
        this._stack = [];
        this.setToIdentity();
        return this;
    }

    set(values: MatrixValues) {
        copy(values, this.values);
        this.valuesUpdated();
        this.dataMode = DataMode.dynamic;
        return this;
    }

    abstract setTranslation(value: Vector): this;
    abstract setTranslation(px: number, py: number, pz?: number): this;
    abstract setRotation2D(radians: number): this;
    setRotationDegrees2D(degrees: number): this { return this.setRotation2D(MathEx.toRadians(degrees)); }
    abstract setSkew(value: Vector): this;
    abstract setSkew(radiansX: number, radiansY: number, radiansZ?: number): this;

    setSkewDegrees(value: Vector): this;
    setSkewDegrees(degreesX: number, degreesY: number, degreesZ?: number): this;
    setSkewDegrees(param1: number | Vector, param2?: number, param3?: number): this {
        let radiansX = 0;
        let radiansY = 0;
        let radiansZ = 0;

        if (param1 instanceof Vector) {
            radiansX = MathEx.toRadians(param1.x);
            radiansY = MathEx.toRadians(param1.y);
            radiansZ = MathEx.toRadians(param1.z);
        } else {
            radiansX = MathEx.toRadians(param1);
            radiansY = MathEx.toRadians(param2!);
            radiansZ = MathEx.toRadians(param3 || 0);
        }

        return this.setSkew(radiansX, radiansY, radiansZ);
    }

    abstract setScale(value: Vector): this;
    abstract setScale(value: number): this;
    abstract setScale(px: number, py: number, pz?: number): this;

    abstract translate(value: Vector): this;
    abstract translate(px: number, py: number, pz?: number): this;
    abstract rotate2D(radians: number): this;
    abstract rotate2D(radians: number, centerX: number, centerY: number): this;
    abstract rotate2D(radians: number, center: Vector): this;

    rotateDegrees2D(degrees: number): this;
    rotateDegrees2D(degrees: number, centerX: number, centerY: number): this;
    rotateDegrees2D(degrees: number, center: Vector): this;
    rotateDegrees2D(degrees: number, param2?: number | Vector, centerY?: number): this {
        const radians = MathEx.toRadians(degrees);

        if (arguments.length === 1) return this.rotate2D(radians);
        if (param2 instanceof Vector) return this.rotate2D(radians, param2);

        return this.rotate2D(radians, param2!, centerY!);
    }

    abstract skew(value: Vector): this;
    abstract skew(radiansX: number, radiansY: number, radiansZ?: number): this;

    skewDegrees(value: Vector): this;
    skewDegrees(degreesX: number, degreesY: number, degreesZ?: number): this;
    skewDegrees(param1: number | Vector, param2?: number, param3?: number): this {
        let radiansX = 0;
        let radiansY = 0;
        let radiansZ = 0;

        if (param1 instanceof Vector) {
            radiansX = MathEx.toRadians(param1.x);
            radiansY = MathEx.toRadians(param1.y);
            radiansZ = MathEx.toRadians(param1.z);
        } else {
            radiansX = MathEx.toRadians(param1);
            radiansY = MathEx.toRadians(param2!);
            radiansZ = MathEx.toRadians(param3 || 0);
        }

        return this.skew(radiansX, radiansY, radiansZ);
    }

    abstract skewX(radians: number): this;
    skewXDegrees(degrees: number) { return this.skewX(MathEx.toRadians(degrees)); }
    abstract skewY(radians: number): this;
    skewYDegrees(degrees: number) { return this.skewY(MathEx.toRadians(degrees)); }
    // @ts-ignore - unused param.
    skewZ(radians: number): this { return this; }
    skewZDegrees(degrees: number) { return this.skewZ(MathEx.toRadians(degrees)); }

    abstract scale(value: Vector): this;
    abstract scale(value: number): this;
    abstract scale(px: number, py: number, pz?: number): this;

    abstract mult(values: MatrixValues): this;
    abstract mult(values1: MatrixValues, values2: MatrixValues): MatrixValues;

    abstract transform(point: Vector, values?: MatrixValues): Vector;

    transformInverse(point: Vector): Vector {
        return this.isInverseValid ? this.transform(point, this.inverse) : Vector.empty;
    }

    abstract calcInverse(values: MatrixValues, result: MatrixValues): MatrixValues | undefined;

    push(): this {
        this._stack.push(this.cloneData());
        return this;
    }

    pop() {
        const data = this._stack.pop();

        if (!data)
            throw new Error("Unbalanced pop.");

        this._data = data;
        return this;
    }

    pushThenIdentity() {
        this.push();
        this.setToIdentity();
    }

    pushThenSet(values: MatrixValues) {
        this.push();
        this.set(values);
    }

    pushThenMult(values: MatrixValues) {
        this.push();
        this.mult(values);
    }

    setThenPush(values: MatrixValues) {
        this.set(values);
        this.push();
    }

    multThenPush(values: MatrixValues) {
        this.mult(values);
        this.push();
    }

    protected valuesUpdated() {
        this._data.isDirtyValues = false;
        this._data.isDirtyInverse = true;
        this._data.isInverseValid = false;
    }

    protected abstract writeTranslation(buffer: MatrixValues, startIndex: number, px?: number, py?: number, pz?: number): number;
    protected abstract writeRotation2D(buffer: MatrixValues, startIndex: number, radians?: number, centerX?: number, centerY?: number): number;
    protected abstract writeSkew(buffer: MatrixValues, startIndex: number, radiansX?: number, radiansY?: number, radiansZ?: number): number;
    protected abstract writeScale(buffer: MatrixValues, startIndex: number, sx?: number, sy?: number, sz?: number): number;
    protected abstract applyTranslation(buffer: MatrixValues, startIndex?: number): number;
    protected abstract applyRotation(buffer: MatrixValues, startIndex?: number): number;
    protected abstract applySkew(buffer: MatrixValues, startIndex?: number): number;
    protected abstract applyScale(buffer: MatrixValues, startIndex?: number): number;

    protected updateValues() {
        this._data.isDirtyValues = false;

        if (this.dataMode === DataMode.fixed) {
            this.getIdentity(this.values);
            let index = 0;
            const buffer = this._buffer;
            index = this.applyTranslation(buffer, ++index);
            index = this.applyRotation(buffer, ++index);
            index = this.applySkew(buffer, ++index);
            this.applyScale(buffer, ++index);
        }

        this.valuesUpdated();
    }

    protected updateInverse() {
        this._data.isDirtyInverse = false;
        this._data.isInverseValid = this.calcInverse(this.values, this.inverse) !== undefined;
    }

    protected cloneData() {
        const result = new MatrixData(this.createValues(), this.createValues());
        this.getValues(result.values);
        this.getInverse(result.inverse);
        result.flags = this._data.flags;
        return result;
    }

    protected clearBuffer() {
        this._bufferIndex = 0;
        this._buffer[this._bufferIndex] = BUFFER_END;
    }

    protected initializeFixedBuffer() {
        this.clearBuffer();
        const buffer = this._buffer;
        let index = 0;
        buffer[index++] = BUFFER_TRANSLATE;
        index = this.writeTranslation(buffer, index);
        buffer[index++] = BUFFER_ROTATE;
        index = this.writeRotation2D(buffer, index);
        buffer[index++] = BUFFER_SKEW;
        index = this.writeSkew(buffer, index);
        buffer[index++] = BUFFER_SCALE;
        index = this.writeScale(buffer, index);
        buffer[index] = BUFFER_END;
        this._bufferIndex = index;
    }

    protected getNextDataStart(dataId: number, startIndex: number) {
        let index = startIndex;
        const buffer = this._buffer;
        let id = buffer[index++];

        while (id !== dataId) {
            switch (id) {
                case BUFFER_TRANSLATE:
                    index += this.translateBufferLength;
                    break;
                case BUFFER_ROTATE:
                    index += this.rotateBufferLength;
                    break;
                case BUFFER_SKEW:
                    index += this.skewBufferLength;
                    break;
                case BUFFER_SCALE:
                    index += this.scaleBufferLength;
                    break;
                case BUFFER_END:
                default:
                    return -1;
            }

            id = buffer[index++];
        }

        return index;
    }
}

Matrix.bufferSize = 255;
