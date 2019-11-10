import { Vector, VectorClass, VectorIndexer } from '.';

export class VectorCollection {
  constructor(count: number, vectorClass: VectorClass);
  constructor(...vectors: Vector[]);
  constructor(...params: (number | VectorClass | Vector)[]) {
    if (params.length === 0)
      this._items = [];
    else if (typeof params[0] === "number") {
      const count = params[0];
      const vectorClass = <VectorClass>params[1];
      const items = new Array<Vector>(count);
      this._items = items;

      for (let i = 0; i < count; i++) {
        items[i] = new vectorClass();
      }
    } else
      this._items = <Vector[]>params;
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
