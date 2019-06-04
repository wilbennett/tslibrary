import { Vector, VectorIndexer } from '.';

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

    get(index: number) { return index >= 0 && index < this.length - 1 ? this.items[index] : Vector.empty; }
    createIndexer() { return new VectorIndexer(this); }
}
