import { DataList, NumberArray } from '../core';

export class VectorDataXYZW extends DataList {
  constructor(count: number);
  constructor(data: NumberArray, elementCount?: number);
  constructor(param1: number | NumberArray) {
    if (typeof param1 === "number") {
      super(new Array<number>(param1 * 4), 4);
    } else {
      super(param1, 4);
    }
  }
}
