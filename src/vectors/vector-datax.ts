import { DataList, NumberArray } from '../core';

export class VectorDataX extends DataList {
  constructor(count: number);
  constructor(data: NumberArray, elementCount?: number);
  constructor(param1: number | NumberArray) {
    if (typeof param1 === "number") {
      super(new Array<number>(param1), 1);
    } else {
      super(param1, 1);
    }
  }

  getStartIndex(index: number) { return index; }
}
