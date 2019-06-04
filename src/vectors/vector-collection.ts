import { Vector } from '.';

export abstract class VectorCollection {
    protected _indexer?: VectorIndexer;

    abstract get length(): number;
    abstract get elementCount(): number;
    abstract get items(): Vector[];
    get indexer() {
        const result = this._indexer || (this._indexer = this.createIndexer());
        result.reset();
        return result;
    }

    get(index: number) { return this.items[index]; }
    createIndexer() { return new VectorIndexer(this); }
}

export class VectorIndexer extends Vector {
    protected _index: number;

    constructor(protected _collection: VectorCollection) {
        super();

        this._index = -1;
    }

    get hasCurrent() { return this._index >= 0 && this._index < this._collection.length; }
    get hasNext() { return this._index < this._collection.length - 1; }
    get hasPrior() { return this._index > 0; }
    get next() { return this.updateCurrent(this._index + 1); }
    get prior() { return this.updateCurrent(this._index - 1); }
    get first() { return this.updateCurrent(0); }
    get last() { return this.updateCurrent(this._collection.length - 1); }

    get x() { return this._collection.get(this._index).x; }
    set x(value) { this._collection.get(this._index).x = value; }
    get y() { return this._collection.get(this._index).y; }
    set y(value) { this._collection.get(this._index).y = value; }
    get w() { return this._collection.get(this._index).w; }
    set w(value) { this._collection.get(this._index).w = value; }

    reset(forward: boolean = true) { this._index = forward ? -1 : this._collection.length; }

    protected updateCurrent(index: number) {
        this._index = index;
        return this.hasCurrent ? this._collection.get(this._index) : Vector.empty;
    }
}

export abstract class VectorGroups {
    abstract get groups(): Map<string, VectorCollection>;
    get count() { return this.groups.size; }

    get elementCount() {
        let sum = 0;

        for (let v of this.groups.values()) {
            sum += v.elementCount;
        }

        return sum;
    }

    abstract get(name: string): VectorCollection | null;
}
