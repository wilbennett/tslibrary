import { NumberArray } from '.';

export class DataList {
  constructor(count: number, elementCount: number);
  constructor(count: number, elementCount: number, data: NumberArray, offset?: number);
  constructor(count: number, elementCount: number, data?: NumberArray, offset: number = 0) {
    this.count = count;
    this.elementCount = elementCount;
    this.offset = 0;

    if (data) {
      this.values = data;
      this.offset = offset;
    } else {
      this.values = new Array<number>(this.count * this.elementCount);
      this.offset = 0;
    }
  }

  static get [Symbol.species]() { return this; }

  readonly offset: number;
  readonly count: number;
  readonly elementCount: number;
  readonly values: NumberArray;

  getStartIndex(index: number) { return this.offset + index * this.elementCount; }

  protected createInstance(values: NumberArray): DataList {
    // @ts-ignore - species pattern.
    const Species = this.constructor[Symbol.species];
    return new Species(this.count, this.elementCount, values, 0);
  }

  clone(): this {
    const values = this.values.slice(this.offset, this.offset + this.count * this.elementCount);
    return <this>this.createInstance(values);
  }

  copyFrom(list: DataList) {
    const itemCount = Math.min(this.count * this.elementCount, list.count * list.elementCount);
    const values = this.values;
    const listValues = list.values;
    const offset = this.offset;
    const listOffset = list.offset;

    for (let i = 0; i < itemCount; i++) {
      values[offset + i] = listValues[listOffset + i];
    }

    return this;
  }
}
