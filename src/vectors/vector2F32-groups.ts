import { Vector2F32Collection, VectorGroups } from '.';

export class Vector2F32Groups extends VectorGroups {
    add(groupName: string, group: Vector2F32Collection) {
        this._groups.set(groupName, group);
    }
}
