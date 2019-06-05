import { Vector, Vector2B, Vector2F32Indexer, VectorCollection, VectorData } from '.';

export class Vector2BCollection extends VectorCollection {
    protected static readonly ERROR_NO_VALUES = "setStorage must be called before accessing values.";

    constructor(count: number) {
        super();

        this._length = count;
    }

    protected _values?: VectorData;
    get values() {
        if (!this._values)
            throw Vector2BCollection.ERROR_NO_VALUES;

        return this._values;
    }
    protected _startIndex: number = 0;
    get startIndex() { return this._startIndex; }

    protected _length: number;
    get length() { return this._length; }
    get elementCount() { return this.length * Vector2B.elementCount; };
    private _items?: Vector[];
    get items() { return this._items || (this._items = this.createItems()); }

    createIndexer() { return new Vector2F32Indexer(this); }

    setStorage(values: VectorData, startIndex: number) {
        this._values = values;
        this._startIndex = startIndex;
        this._items = undefined;
    }

    protected createItems() {
        if (!this._values)
            throw Vector2BCollection.ERROR_NO_VALUES;

        const length = this._length;
        let index = this._startIndex;

        if (!this._items)
            this._items = new Array<Vector2B>(length);

        for (let i = 0; i < length; i++) {
            this._items[i] = new Vector2B(this._values, index);
            index += Vector2B.elementCount;
        }

        return this._items;
    }
}
