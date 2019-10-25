import { isTypedArray, NumberArray } from '.';

export class DataList {
  constructor(count: number, elementCount: number);
  constructor(data: NumberArray, elementCount: number);
  constructor(param1: number | NumberArray, elementCount: number) {
    if (typeof param1 === "number") {
      this.count = param1;
      this.elementCount = elementCount;
      this.values = new Array<number>(this.count * this.elementCount);
    } else {
      this.values = param1;
      this.elementCount = elementCount;
      this.count = Math.trunc(this.values.length / this.elementCount);
    }
  }

  static get [Symbol.species]() { return this; }

  readonly count: number;
  readonly elementCount: number;
  readonly values: NumberArray;

  getStartIndex(index: number) { return index * this.elementCount; }

  clone() {
    const values = isTypedArray(this.values)
      // @ts-ignore - constructor call.
      ? new this.values.constructor(this.values)
      : this.values.slice();

    // @ts-ignore - species pattern.
    const Species = this.constructor[Symbol.species];
    return new Species(values, this.elementCount);
  }

  copyFrom(list: DataList) {
    const itemCount = Math.min(this.values.length, list.values.length);
    const values = this.values;
    const listValues = list.values;

    for (let i = 0; i < itemCount; i++) {
      values[i] = listValues[i];
    }

    return this;
  }
}
