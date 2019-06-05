import { Vector, VectorCollection, VectorData } from '.';

export abstract class VectorBCollection extends VectorCollection {
    protected static readonly ERROR_NO_VALUES = "setStorage must be called before accessing values.";

    constructor(count: number) {
        super();

        this._length = count;
    }

    protected _values?: VectorData;
    get values() {
        if (!this._values)
            throw VectorBCollection.ERROR_NO_VALUES;

        return this._values;
    }
    protected _startIndex: number = 0;
    get startIndex() { return this._startIndex; }

    protected _length: number;
    get length() { return this._length; }
    protected _items?: Vector[];
    get items() { return this._items || (this._items = this.createItems()); }

    setStorage(values: VectorData, startIndex: number) {
        this._values = values;
        this._startIndex = startIndex;
        this._items = undefined;
    }

    protected abstract createItemsCore(values: VectorData): Vector[];

    protected createItems() {
        if (!this._values)
            throw VectorBCollection.ERROR_NO_VALUES;

        return this.createItemsCore(this._values);
    }
}
