import { VectorBGroupsBuilder } from '.';

export class VectorF32GroupsBuilder extends VectorBGroupsBuilder {
    protected createBuffer(elementCount: number) {
        return new ArrayBuffer(elementCount * Float32Array.BYTES_PER_ELEMENT);
    }

    protected createValues(buffer: ArrayBuffer) { return new Float32Array(buffer); }
}
