import { Vector2BCollection, VectorGroups } from '.';

export class VectorBGroups extends VectorGroups {
    add(groupName: string, group: Vector2BCollection) {
        this._groups.set(groupName, group);
    }
}
