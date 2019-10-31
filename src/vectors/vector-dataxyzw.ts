import { DataList, NumberArray } from '../core';

export class VectorDataXYZW extends DataList {
  constructor(count: number);
  constructor(count: number, data: NumberArray, offset?: number);
  constructor(count: number, data?: NumberArray, offset: number = 0) {
    const elementCount = 4;

    if (data) {
      super(count, elementCount, data, offset);
    } else {
      super(count, elementCount);
    }
  }

  protected createInstance(values: NumberArray) { return new VectorDataXYZW(this.count, values); }
}
