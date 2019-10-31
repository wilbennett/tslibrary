import { VectorGroups } from '.';
import { DataList } from '../core';

export class VectorBGroups extends VectorGroups {
  constructor(public readonly data: DataList) {
    super();
  }
}
