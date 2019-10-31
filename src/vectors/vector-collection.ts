import { Vector, VectorIndexer } from '.';

export class VectorCollection {
  constructor(...vectors: Vector[]) {
    this._items = vectors;
  }

  get length() { return this.items.length; }
  get elementCount() { return this.items.length > 0 ? this.items[0].elementCount : 0; }

  protected _items?: Vector[];
  get items() { return this._items!; }

  protected _indexer?: VectorIndexer;
  get indexer() {
    const result = this._indexer || (this._indexer = this.createIndexer());
    result.reset();
    return result;
  }

  get(index: number) { return index >= 0 && index < this.length ? this.items[index] : Vector.empty; }
  createIndexer(): VectorIndexer { return new VectorIndexer(this); }
}
