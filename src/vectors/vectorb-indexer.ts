import { Vector, VectorBCollection, VectorData, VectorIndexer } from '.';

export class VectorBIndexer extends VectorIndexer {
    protected _values: VectorData;
    protected _startIndex: number;

    constructor(collection: VectorBCollection) {
        super(collection);
        this._values = collection.values;
        this._startIndex = collection.startIndex;
    }

    get current() { return this.updateCurrent(this._index); }
    get x() { return 0; }
    // @ts-ignore - unused params.
    set x(value) { }
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
