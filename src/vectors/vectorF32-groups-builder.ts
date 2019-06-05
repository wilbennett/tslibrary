import { Vector2BCollection, VectorBGroups, VectorDimension, VectorGroups, VectorGroupsBuilder } from '.';

export class VectorF32GroupsBuilder extends VectorGroupsBuilder {
    protected _groups = new VectorBGroups();

    get Groups(): VectorGroups {
        const int32bytes = 32 / 8;
        const buffer = new ArrayBuffer(this._groups.elementCount * int32bytes);
        const array = new Float32Array(buffer);
        let index = 0;
        let collections = this._groups.groups.values();

        for (const collection of collections) {
            const item = <Vector2BCollection>collection;
            item.setStorage(array, index);
            index += item.elementCount;
        }

        return this._groups;
    }

    add(groupName: string, dimensions: VectorDimension, count: number) {
        switch (dimensions) {
            case 1:
                // TODO: Implement
                break;

            case 2:
                this._groups.add(groupName, new Vector2BCollection(count));
                break;

            default:
                this.unsupportedElementCount(dimensions);
        }

        return this;
    }
}
