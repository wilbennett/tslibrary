import { Vector, Vector3B, VectorBCollection, VectorData, VectorIndexer } from '.';

export class Vector3BIndexer extends VectorIndexer {
    protected _values: VectorData;
    protected _startIndex: number;

    constructor(collection: VectorBCollection) {
        super(collection);
        this._values = collection.values;
        this._startIndex = collection.startIndex;
    }

    get current() { return this.updateCurrent(this._index); }
    get x() { return this._values[this._index * Vector3B.elementCount + this._startIndex]; }
    set x(value) { this._values[this._index * Vector3B.elementCount + this._startIndex] = value; }
    get y() { return this._values[this._index * Vector3B.elementCount + this._startIndex + 1]; }
    set y(value) { this._values[this._index * Vector3B.elementCount + this._startIndex + 1] = value; }
    get z() { return this._values[this._index * Vector3B.elementCount + this._startIndex + 2]; }
    set z(value) { this._values[this._index * Vector3B.elementCount + this._startIndex + 2] = value; }
    get w() { return this._values[this._index * Vector3B.elementCount + this._startIndex + 3]; }
    set w(value) { this._values[this._index * Vector3B.elementCount + this._startIndex + 3] = value; }

    protected updateCurrent(index: number) {
        this._index = index;
        return this.hasCurrent ? this : Vector.empty;
    }
}
