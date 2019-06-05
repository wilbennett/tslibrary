import { Vector2B, Vector2BIndexer, VectorBCollection, VectorData } from '.';

export class Vector2BCollection extends VectorBCollection {
    constructor(count: number) {
        super(count);
    }

    get elementCount() { return this.length * Vector2B.elementCount; };

    createIndexer() { return new Vector2BIndexer(this); }

    protected createItemsCore(values: VectorData) {
        const length = this._length;
        let index = this._startIndex;

        if (!this._items)
            this._items = new Array<Vector2B>(length);

        for (let i = 0; i < length; i++) {
            this._items[i] = new Vector2B(values, index);
            index += Vector2B.elementCount;
        }

        return this._items;
    }
}
