import { VectorCollection } from '.';

export abstract class VectorGroups {
    abstract get groups(): Map<string, VectorCollection>;
    get count() { return this.groups.size; }

    get elementCount() {
        let sum = 0;

        for (let v of this.groups.values()) {
            sum += v.elementCount;
        }

        return sum;
    }

    abstract get(name: string): VectorCollection | null;
}
