import { Vector3B, Vector3BIndexer, VectorBCollection, VectorData, VectorIndexer } from '.';

export class Vector3BCollection extends VectorBCollection {
    constructor(count: number) {
        super(count);
    }

    get elementCount() { return this.length * Vector3B.elementCount; };

    createIndexer(): VectorIndexer { return new Vector3BIndexer(this); }

    protected createItemsCore(values: VectorData) {
        const length = this._length;
        let index = this._startIndex;

        if (!this._items)
            this._items = new Array<Vector3B>(length);

        for (let i = 0; i < length; i++) {
            this._items[i] = new Vector3B(values, index);
            index += Vector3B.elementCount;
        }

        return this._items;
    }
}
