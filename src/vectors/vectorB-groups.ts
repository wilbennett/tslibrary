import { VectorBCollection, VectorGroups } from '.';

export class VectorBGroups extends VectorGroups {
    add(groupName: string, group: VectorBCollection) {
        this._groups.set(groupName, group);
    }
}
