import {
    Vector1BCollection,
    Vector2BCollection,
    VectorBCollection,
    VectorBGroups,
    VectorData,
    VectorDimension,
    VectorGroups,
    VectorGroupsBuilder,
} from '.';

export abstract class VectorBGroupsBuilder extends VectorGroupsBuilder {
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
                this._groups.add(groupName, new Vector1BCollection(count));
                break;

            case 2:
                this._groups.add(groupName, new Vector2BCollection(count));
                break;

            default:
                this.unsupportedDimension(dimensions);
        }

        return this;
    }

    protected abstract createBuffer(elementCount: number): ArrayBuffer;
    protected abstract createValues(buffer: ArrayBuffer): VectorData;
}
