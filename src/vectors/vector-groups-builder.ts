import { VectorCollection, VectorGroups } from '.';

export abstract class VectorGroupsBuilder {
    abstract get Groups(): VectorGroups;
    abstract add(groupName: string, count: number): VectorGroupsBuilder;
    abstract add(groupName: string, group: VectorCollection): VectorGroupsBuilder;
}
