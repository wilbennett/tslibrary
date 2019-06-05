import { Vector2BCollection, VectorGroups } from '.';

export class Vector2F32Groups extends VectorGroups {
    add(groupName: string, group: Vector2BCollection) {
        this._groups.set(groupName, group);
    }
}
