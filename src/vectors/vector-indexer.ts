import { Vector, VectorCollection } from '.';

export class VectorIndexer extends Vector {
    protected _index: number;

    constructor(protected _collection: VectorCollection) {
        super();
        this._index = -1;
    }

    get hasCurrent() { return this._index >= 0 && this._index < this._collection.length; }
    get hasNext() { return this._index < this._collection.length - 1; }
    get hasPrior() { return this._index > 0; }
    get current() { return this._collection.get(this._index); }
    get next() { return this.updateCurrent(this._index + 1); }
    get prior() { return this.updateCurrent(this._index - 1); }
    get first() { return this.updateCurrent(0); }
    get last() { return this.updateCurrent(this._collection.length - 1); }
    get x() { return this._collection.get(this._index).x; }
    set x(value) { this._collection.get(this._index).x = value; }
    get y() { return this._collection.get(this._index).y; }
    set y(value) { this._collection.get(this._index).y = value; }
    get z() { return this._collection.get(this._index).z; }
    set z(value) { this._collection.get(this._index).z = value; }
    get w() { return this._collection.get(this._index).w; }
    set w(value) { this._collection.get(this._index).w = value; }
    reset(forward: boolean = true) { this._index = forward ? -1 : this._collection.length; }

    protected updateCurrent(index: number) {
        this._index = index;
        return this._collection.get(this._index);
    }
}
