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

export function copy(
    source: MatrixValues,
    result: MatrixValues,
    sourceIndex: number = 0,
    resultIndex: number = 0,
    sourceLength?: number) {

    sourceLength = sourceLength || source.length - sourceIndex;

    if (Array.isArray(result)) {
        if (Array.isArray(source)) {
            if (sourceIndex === 0)
                result.splice(resultIndex, sourceLength, ...source);
            else
                result.splice(resultIndex, sourceLength, ...source.slice(sourceIndex, sourceLength + 1));
        } else {
            let send = sourceIndex + sourceLength;
            let ri = resultIndex;

            for (let i = sourceIndex; i < send; i++) {
                result[ri++] = source[i];
            }
        }

        return result;
    }

    if (sourceIndex === 0)
        result.set(source, resultIndex);
    else {
        let send = sourceIndex + sourceLength;
        let ri = resultIndex;

        for (let i = sourceIndex; i < send; i++) {
            result[ri++] = source[i];
        }
    }

    return result;
}

const BUFFER_END = -1;
const BUFFER_TRANSLATE = 1;
const BUFFER_ROTATE = 2;
const BUFFER_SKEW = 3;
const BUFFER_SCALE = 4;
const BUFFER_TRANSFORM = 5;

export abstract class Matrix {
    protected static readonly BUFFER_END = BUFFER_END;
    protected static readonly BUFFER_TRANSLATE = BUFFER_TRANSLATE;
    protected static readonly BUFFER_ROTATE = BUFFER_ROTATE;
    protected static readonly BUFFER_SKEW = BUFFER_SKEW;
    protected static readonly BUFFER_SCALE = BUFFER_SCALE;
    protected static readonly BUFFER_TRANSFORM = BUFFER_TRANSFORM;

    protected _data: MatrixData;
    protected _buffer: MatrixValues;
    protected _bufferIndex: number;
    protected _dataStarts: MatrixValues;
    protected _dataCount: number;
    protected _stack: MatrixData[] = [];

    constructor(data: MatrixData) {
        this._data = data;

        this._buffer = new Array<number>(Matrix.bufferSize);
        this._bufferIndex = 0;
        // Rough guesstimate of maximum number of data entries the buffer can contain.
        this._dataStarts = new Array<number>(Matrix.bufferSize / 3);
        this._dataCount = 0;
    }

    private static _bufferSize: number;
    static get bufferSize() { return this._bufferSize; }
    static set bufferSize(value) { this._bufferSize = Math.max(value, 255); }

    abstract get elementCount(): number;

    // protected get isBufferEmpty() { return this._bufferIndex === 0 && this._buffer[this._bufferIndex] === BUFFER_END; }
    // protected abstract get translateBufferLength(): number;
    // protected abstract get rotateBufferLength(): number;
    // protected abstract get skewBufferLength(): number;
    // protected abstract get scaleBufferLength(): number;

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

        if (value === DataMode.fixed)
            this.initializeFixedBuffer();
        else
            this.clearBuffer();

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
        this.dataMode = DataMode.dynamic;
        this.clearBuffer();
        this._data.isDirtyValues = true;
        this._data.isDirtyInverse = true;
        this._data.isInverseValid = false;
        const buffer = this._buffer;
        let index = this._bufferIndex;
        this._dataStarts[this._dataCount++] = index;
        buffer[index++] = Matrix.BUFFER_TRANSFORM;
        copy(values, buffer, 0, index, this.elementCount);
        index += this.elementCount;
        buffer[index] = Matrix.BUFFER_END;
        this._bufferIndex = index;
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
    protected abstract applyTranslation(buffer: MatrixValues, startIndex: number, inverse?: boolean): number;
    protected abstract applyRotation(buffer: MatrixValues, startIndex: number, inverse?: boolean): number;
    protected abstract applySkew(buffer: MatrixValues, startIndex: number, inverse?: boolean): number;
    protected abstract applyScale(buffer: MatrixValues, startIndex: number, inverse?: boolean): number;
    protected abstract applyTransform(buffer: MatrixValues, startIndex: number, inverse?: boolean): number;

    protected writeTransform(buffer: MatrixValues, startIndex: number, values: MatrixValues): number {
        let index = startIndex;
        copy(values, buffer, 0, startIndex, this.elementCount);
        return index + this.elementCount;
    }

    protected updateValues() {
        this._data.isDirtyValues = false;

        const buffer = this._buffer;
        this.getIdentity(this.values);
        let index = 0;
        let id = buffer[index++];

        while (id !== Matrix.BUFFER_END && index >= 0) {
            switch (id) {
                case BUFFER_TRANSLATE:
                    index = this.applyTranslation(buffer, index);
                    break;
                case BUFFER_ROTATE:
                    index = this.applyRotation(buffer, index);
                    break;
                case BUFFER_SKEW:
                    index = this.applySkew(buffer, index);
                    break;
                case BUFFER_SCALE:
                    index = this.applyScale(buffer, index);
                    break;
                case BUFFER_TRANSFORM:
                    index = this.applyTransform(buffer, index);
                    break;
            }

            id = buffer[index++];
        }

        this.valuesUpdated();
    }

    protected updateInverse() {
        // TODO: Figure out how isDirtyInverse can be false when isInverseValid is true.
        // if (!this._data.isDirtyInverse || this._data.isInverseValid) return;

        this._data.isDirtyInverse = false;

        // if (this.dataMode === DataMode.dynamic) {
        //     this._data.isInverseValid = this.calcInverse(this.values, this.inverse) !== undefined;
        //     return;
        // }

        const dataStarts = this._dataStarts;
        const buffer = this._buffer;
        const temp = this.values;
        const inverse = this.getIdentity(this._data.inverse);
        this._data.values = inverse;
        let index = 0;

        for (let i = this._dataCount - 1; i >= 0; i--) {
            index = dataStarts[i];
            const id = buffer[index++];

            switch (id) {
                case BUFFER_TRANSLATE:
                    this.applyTranslation(buffer, index, true);
                    break;
                case BUFFER_ROTATE:
                    this.applyRotation(buffer, index, true);
                    break;
                case BUFFER_SKEW:
                    index = this.applySkew(buffer, index, true);
                    break;
                case BUFFER_SCALE:
                    this.applyScale(buffer, index, true);
                    break;
                case BUFFER_TRANSFORM:
                    index = this.applyTransform(buffer, index, true);
                    break;
            }

            if (index < 0) break;
        }

        this._data.values = temp;

        if (index < 0) {
            if (this.calcInverse(this.values, this.inverse) !== undefined)
                index = 0;
        }

        this._data.isInverseValid = index >= 0;
    }

    protected cloneData() {
        const result = new MatrixData(this.createValues(), this.createValues());
        this.getValues(result.values);
        this.getInverse(result.inverse);
        result.flags = this._data.flags;
        return result;
    }

    protected clearBuffer() {
        this._dataCount = 0;
        this._bufferIndex = 0;
        this._buffer[this._bufferIndex] = BUFFER_END;
    }

    protected initializeFixedBuffer() {
        this.clearBuffer();
        const buffer = this._buffer;
        const dataStarts = this._dataStarts;
        let index = 0;
        let startIndex = 0;

        dataStarts[startIndex++] = index;
        buffer[index++] = BUFFER_TRANSLATE;
        index = this.writeTranslation(buffer, index);

        dataStarts[startIndex++] = index;
        buffer[index++] = BUFFER_ROTATE;
        index = this.writeRotation2D(buffer, index);

        dataStarts[startIndex++] = index;
        buffer[index++] = BUFFER_SKEW;
        index = this.writeSkew(buffer, index);

        dataStarts[startIndex] = index;
        buffer[index++] = BUFFER_SCALE;
        index = this.writeScale(buffer, index);

        buffer[index] = BUFFER_END;
        this._bufferIndex = index;
        this._dataCount = 4;
    }

    protected getDataStart(dataId: number) {
        const buffer = this._buffer;
        const dataStarts = this._dataStarts;
        const maxIndex = this._dataCount - 1;
        let dataIndex = 0;
        let index = -1;

        while (dataIndex <= maxIndex) {
            const startIndex = dataStarts[dataIndex];

            if (buffer[startIndex] === dataId) {
                index = startIndex + 1;
                break;
            }

            dataIndex++;
        }

        return index;
    }
}

Matrix.bufferSize = 255;
