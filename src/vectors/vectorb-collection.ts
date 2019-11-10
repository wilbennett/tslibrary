import { Vector, Vector1B, Vector2B, Vector3B, VectorCollection, VectorIndexer } from '.';
import { DataList } from '../core';

// TODO: Refactor to use VectorBClass.
export class VectorBCollection extends VectorCollection {
  constructor(data: DataList);
  constructor(...vectors: Vector[]);
  constructor(param1: DataList | Vector, ...rest: Vector[]) {
    super();

    if (param1 instanceof DataList) {
      this.data = param1;
    } else {
      const count = rest.length + 1;
      // @ts-ignore - indexer.
      const elementCount = +param1.constructor["elementCount"];
      const values = new Array<number>(count * elementCount);
      let index = 0;
      index = param1.writeTo(values, index);

      for (let i = 0; i < rest.length; i++) {
        index = rest[i].writeTo(values, index);
      }

      this.data = new DataList(count, elementCount, values);
    }
  }

  public readonly data: DataList;
  get length() { return this.items.length; }
  get elementCount() { return this.data.elementCount; }

  protected _items?: Vector[];
  get items() { return this._items || (this._items = this.createItems(this.data)); }

  protected _indexer?: VectorIndexer;
  get indexer() {
    const result = this._indexer || (this._indexer = this.createIndexer());
    result.reset();
    return result;
  }

  get(index: number) { return index >= 0 && index < this.length ? this.items[index] : Vector.empty; }
  createIndexer(): VectorIndexer { return new VectorIndexer(this); }

  protected createItems(data: DataList) {
    const length = data.count;
    let vector: typeof Vector1B | typeof Vector2B | typeof Vector3B;

    switch (data.elementCount) {
      case 1: vector = Vector1B; break;
      case 3: vector = Vector2B; break;
      case 4: vector = Vector3B; break;
      default: throw new Error(`Unsupported element count (${data.elementCount}).`);
    }

    const items = new Array<Vector>(length);

    for (let i = 0; i < length; i++) {
      // @ts-ignore - data type.
      items[i] = new vector(data, i);
    }

    return items;
  }
}
