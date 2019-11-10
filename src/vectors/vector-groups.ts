import { VectorCollection, EMPTY_VECTOR_COLLECTION } from '.';

export class VectorGroups {
  constructor() {
  }

  protected _groups = new Map<string, VectorCollection>();
  get groups() { return this._groups; }
  get count() { return this.groups.size; }

  get totalElementCount() {
    let sum = 0;

    for (let v of this.groups.values()) {
      sum += v.elementCount * v.length;
    }

    return sum;
  }

  get(name: string) { return this.groups.get(name) || EMPTY_VECTOR_COLLECTION; }

  add(groupName: string, group: VectorCollection) {
    this._groups.set(groupName, group);
  }
}
