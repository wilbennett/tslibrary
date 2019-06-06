import { Vector2B, VectorBCollection, VectorBIndexer } from '.';

export class Vector2BIndexer extends VectorBIndexer {
    constructor(collection: VectorBCollection) {
        super(collection);
    }

    get x() { return this._values[this._index * Vector2B.elementCount + this._startIndex]; }
    set x(value) { this._values[this._index * Vector2B.elementCount + this._startIndex] = value; }
    get y() { return this._values[this._index * Vector2B.elementCount + this._startIndex + 1]; }
    set y(value) { this._values[this._index * Vector2B.elementCount + this._startIndex + 1] = value; }
    get w() { return this._values[this._index * Vector2B.elementCount + this._startIndex + 2]; }
    set w(value) { this._values[this._index * Vector2B.elementCount + this._startIndex + 2] = value; }
}
