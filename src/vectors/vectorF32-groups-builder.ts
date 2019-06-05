import {
    Vector2BCollection,
    VectorBCollection,
    VectorBGroups,
    VectorDimension,
    VectorGroups,
    VectorGroupsBuilder,
} from '.';

export class VectorF32GroupsBuilder extends VectorGroupsBuilder {
    protected _groups = new VectorBGroups();

    get Groups(): VectorGroups {
        const buffer = this.createBuffer(this._groups.elementCount);
        const array = this.createValues(buffer);
        let index = 0;
        let collections = this._groups.groups.values();

        for (const collection of collections) {
            const item = <VectorBCollection>collection;
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

    protected createBuffer(elementCount: number) {
        return new ArrayBuffer(elementCount * Float32Array.BYTES_PER_ELEMENT);
    }

    protected createValues(buffer: ArrayBuffer) { return new Float32Array(buffer); }
}
