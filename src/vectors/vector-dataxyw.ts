import { DataList, NumberArray } from '../core';

export class VectorDataXYW extends DataList {
  constructor(count: number);
  constructor(data: NumberArray, elementCount?: number);
  constructor(param1: number | NumberArray) {
    if (typeof param1 === "number") {
      super(new Array<number>(param1 * 3), 3);
    } else {
      super(param1, 3);
    }
  }
}
