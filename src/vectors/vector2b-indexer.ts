import { Vector, Vector2B, Vector2BCollection, VectorData, VectorIndexer } from '.';

export class Vector2BIndexer extends VectorIndexer {
    protected _values: VectorData;
    protected _startIndex: number;

    constructor(collection: Vector2BCollection) {
        super(collection);
        this._values = collection.values;
        this._startIndex = collection.startIndex;
    }

    get current() { return this._collection.get(this._index); }
    get x() { return this._values[this._index * Vector2B.elementCount + this._startIndex]; }
    set x(value) { this._values[this._index * Vector2B.elementCount + this._startIndex] = value; }
    get y() { return this._values[this._index * Vector2B.elementCount + this._startIndex + 1]; }
    set y(value) { this._values[this._index * Vector2B.elementCount + this._startIndex + 1] = value; }
    get z() { return 0; }
    // @ts-ignore - unused params.
    set z(value) { }
    get w() { return this._values[this._index * Vector2B.elementCount + this._startIndex + 2]; }
    set w(value) { this._values[this._index * Vector2B.elementCount + this._startIndex + 2] = value; }

    protected updateCurrent(index: number) {
        this._index = index;
        return this.hasCurrent ? this : Vector.empty;
    }
}
