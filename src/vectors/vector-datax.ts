import { DataList, NumberArray } from '../core';

export class VectorDataX extends DataList {
  constructor(count: number);
  constructor(count: number, data: NumberArray, offset?: number);
  constructor(count: number, data?: NumberArray, offset: number = 0) {
    const elementCount = 1;

    if (data) {
      super(count, elementCount, data, offset);
    } else {
      super(count, elementCount);
    }
  }

  getStartIndex(index: number) { return index; }

  protected createInstance(values: NumberArray) { return new VectorDataX(this.count, values); }
}
