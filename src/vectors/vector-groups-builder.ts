import { Vector, Vector1D, Vector2D, Vector3D, VectorCollection, VectorGroups } from '.';

export type GroupInfo = [string, number, number];

export class VectorGroupsBuilder {
  protected _groupInfos: GroupInfo[] = [];
  get Groups(): VectorGroups {
    const groups = new VectorGroups();

    for (const [name, count, elementCount] of this._groupInfos) {

      let vector: typeof Vector1D | typeof Vector2D | typeof Vector3D;

      switch (elementCount) {
        case 1: vector = Vector1D; break;
        case 3: vector = Vector2D; break;
        case 4: vector = Vector3D; break;
        default: throw new Error(`Unsupported element count (${elementCount}).`);
      }

      const vectors = new Array<Vector>(count);

      for (let i = 0; i < count; i++) {
        vectors[i] = new vector();
      }

      const group = new VectorCollection(...vectors);
      groups.add(name, group);
    }

    return groups;
  }

  add(groupName: string, count: number, elementCount: number): this {
    this._groupInfos.push([groupName, count, elementCount]);
    return this;
  }
}
