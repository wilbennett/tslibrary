import { Vector, Vector2, VectorCollection } from '.';

export class Vector2Collection extends VectorCollection {
    constructor(...items: Vector[]) {
        super();
        this._items = items;
    }

    get elementCount() { return Vector2.elementCount; }
    private _items: Vector[];
    get items() { return this._items; }
}
