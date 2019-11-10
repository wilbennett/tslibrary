import { VectorClass, VectorCollection, VectorGroups } from '.';

export type GroupInfo = [string, number, VectorClass];

export class VectorGroupsBuilder {
  protected _groupInfos: GroupInfo[] = [];
  get Groups(): VectorGroups {
    const groups = new VectorGroups();

    for (const [name, count, vectorClass] of this._groupInfos) {
      const group = new VectorCollection(count, vectorClass);
      groups.add(name, group);
    }

    return groups;
  }

  add(groupName: string, count: number, vectorClass: VectorClass): this {
    this._groupInfos.push([groupName, count, vectorClass]);
    return this;
  }
}
