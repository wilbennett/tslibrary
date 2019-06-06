import { Vector1B, VectorBCollection, VectorBIndexer } from '.';

export class Vector1BIndexer extends VectorBIndexer {
    constructor(collection: VectorBCollection) {
        super(collection);
    }

    get x() { return this._values[this._index * Vector1B.elementCount + this._startIndex]; }
    set x(value) { this._values[this._index * Vector1B.elementCount + this._startIndex] = value; }
}
