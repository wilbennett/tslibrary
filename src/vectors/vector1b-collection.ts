import { Vector1B, Vector1BIndexer, VectorBCollection, VectorData, VectorIndexer } from '.';

export class Vector1BCollection extends VectorBCollection {
    constructor(count: number) {
        super(count);
    }

    get elementCount() { return this.length * Vector1B.elementCount; };

    createIndexer(): VectorIndexer { return new Vector1BIndexer(this); }

    protected createItemsCore(values: VectorData) {
        const length = this._length;
        let index = this._startIndex;

        if (!this._items)
            this._items = new Array<Vector1B>(length);

        for (let i = 0; i < length; i++) {
            this._items[i] = new Vector1B(values, index);
            index += Vector1B.elementCount;
        }

        return this._items;
    }
}
