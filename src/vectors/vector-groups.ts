import { VectorCollection } from '.';

export abstract class VectorGroups {
    protected _groups = new Map<string, VectorCollection>();
    get groups() { return this._groups; }
    get count() { return this.groups.size; }

    get elementCount() {
        let sum = 0;

        for (let v of this.groups.values()) {
            sum += v.elementCount;
        }

        return sum;
    }

    get(name: string) { return this.groups.get(name); }
}
