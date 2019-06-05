import { Vector, Vector1B, VectorBCollection, VectorData, VectorIndexer } from '.';

export class Vector1BIndexer extends VectorIndexer {
    protected _values: VectorData;
    protected _startIndex: number;

    constructor(collection: VectorBCollection) {
        super(collection);
        this._values = collection.values;
        this._startIndex = collection.startIndex;
    }

    get current() { return this._collection.get(this._index); }
    get x() { return this._values[this._index * Vector1B.elementCount + this._startIndex]; }
    set x(value) { this._values[this._index * Vector1B.elementCount + this._startIndex] = value; }
    get y() { return 0; }
    // @ts-ignore - unused params.
    set y(value) { }
    get z() { return 0; }
    // @ts-ignore - unused params.
    set z(value) { }
    get w() { return 0; }
    // @ts-ignore - unused params.
    set w(value) { }

    protected updateCurrent(index: number) {
        this._index = index;
        return this.hasCurrent ? this : Vector.empty;
    }
}
