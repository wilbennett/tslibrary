import {
  GroupInfo,
  VectorBCollection,
  VectorBGroups,
  VectorDataXYW,
  VectorDataXYZW,
  VectorGroups,
  VectorGroupsBuilder,
} from '.';
import { DataList } from '../core';
import { VectorDataX } from './vector-datax';

export class VectorBGroupsBuilder extends VectorGroupsBuilder {
  get Groups(): VectorGroups {
    let size = this.calcSize(this._groupInfos);
    const buffer = this.createBuffer(size);
    const bufferValues = buffer.values;
    const groups = new VectorBGroups(buffer);
    let index = 0;

    for (const [name, count, elementCount] of this._groupInfos) {
      let data: DataList;

      switch (elementCount) {
        case 1:
          data = new VectorDataX(count, bufferValues, index);
          break;
        case 3:
          data = new VectorDataXYW(count, bufferValues, index);
          break;
        case 4:
          data = new VectorDataXYZW(count, bufferValues, index);
          break;
        default: throw new Error(`Unsupported element count (${elementCount}).`);
      }

      const group = new VectorBCollection(data);
      groups.add(name, group);
      index += data.elementCount;
    }

    return groups;
  }

  protected calcSize(groupInfos: GroupInfo[]) {
    let size = 0;

    for (let [, count, elementCount] of groupInfos) {
      size += count * elementCount;
    }

    return size;
  }

  protected createBuffer(size: number): DataList {
    return new DataList(size, 1);
  }
}
