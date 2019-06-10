import { VectorDimension, VectorGroups } from '.';

export abstract class VectorGroupsBuilder {
    abstract get Groups(): VectorGroups;
    abstract add(groupName: string, dimensions: VectorDimension, count: number): this;

    protected unsupportedDimension(value: never) {
        throw new Error(`Element count of ${value} is not supported`);
    }
}
