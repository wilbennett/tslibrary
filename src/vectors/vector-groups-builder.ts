import { VectorDimension, VectorGroups } from '.';

export abstract class VectorGroupsBuilder {
    abstract get Groups(): VectorGroups;
    abstract add(groupName: string, dimensions: VectorDimension, count: number): this;

    protected unsupportedElementCount(value: never) {
        throw `Element count of ${value} is not supported`;
    }
}
