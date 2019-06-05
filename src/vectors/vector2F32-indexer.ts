import { Vector, Vector2F32, Vector2F32Collection, VectorIndexer } from '.';

export class Vector2F32Indexer extends VectorIndexer {
    protected _valuesF32: Float32Array;
    protected _startIndex: number;

    constructor(collection: Vector2F32Collection) {
        super(collection);
        this._valuesF32 = collection.values;
        this._startIndex = collection.startIndex;
    }

    get current() { return this._collection.get(this._index); }
    get x() { return this._valuesF32[this._index * Vector2F32.elementCount + this._startIndex]; }
    set x(value) { this._valuesF32[this._index * Vector2F32.elementCount + this._startIndex] = value; }
    get y() { return this._valuesF32[this._index * Vector2F32.elementCount + this._startIndex + 1]; }
    set y(value) { this._valuesF32[this._index * Vector2F32.elementCount + this._startIndex + 1] = value; }
    get w() { return this._valuesF32[this._index * Vector2F32.elementCount + this._startIndex + 2]; }
    set w(value) { this._valuesF32[this._index * Vector2F32.elementCount + this._startIndex + 2] = value; }

    protected updateCurrent(index: number) {
        this._index = index;
        return this.hasCurrent ? this : Vector.empty;
    }
}
