import { GroupAction } from '.';
import { ForceProcessParams } from '..';
import { MathEx } from '../../../core';
import { dir, Vector } from '../../../vectors';
import { CircleSegmentInfo } from '../../shapes';

const desired = dir(0, 0);
const toShape = dir(0, 0);

export class Lateral extends GroupAction {
  radius: number = 5;
  protected _fieldOfView: number = 60 * MathEx.ONE_DEGREE;
  get fieldOfView() { return this._fieldOfView; }
  set fieldOfView(value) {
    this._fieldOfView = value;
    this._indexOffset = Math.round(value * MathEx.ONE_RADIAN * 0.5);
  }
  protected _indexOffset = 0;
  protected _segments = new CircleSegmentInfo(360);

  protected getLeftIndex(startIndex: number, offset: number) {
    let result = startIndex + offset;
    result > 359 && (result = result - 359);
    return result;
  }

  protected getRightIndex(startIndex: number, offset: number) {
    let result = startIndex - offset;
    result < 0 && (result = result + 360);
    return result;
  }

  protected calcDesiredVelocity(params: ForceProcessParams) {
    const { position } = params;

    const radius = this.radius;
    const radiusSquared = radius * radius;
    const segments = this._segments;
    const fovIndexOffset = this._indexOffset;
    desired.withXY(0, 0);
    let count = 0;

    for (const shape of this._group!) {
      shape.position.subO(position, toShape);
      const distanceSquared = toShape.magSquared;

      if (distanceSquared === 0 || distanceSquared >= radiusSquared) continue;

      const index = segments.getIndex(shape.angle);
      const direction = segments.getVertexDirection(index);
      const directionSide = direction.cross2D(toShape);
      const left = segments.getVertexDirection(this.getLeftIndex(index, fovIndexOffset));
      const right = segments.getVertexDirection(this.getRightIndex(index, fovIndexOffset));
      const isLeft = directionSide > 0 && toShape.cross2D(left) > 0;
      const isRight = directionSide <= 0 && right.cross2D(toShape) > 0;

      if (!isLeft && !isRight) continue;

      const offset = isLeft ? toShape.perpRight() : toShape.perpLeft();
      desired.add(offset);
      count++;
    }

    return count > 0 ? desired.div(count).normalizeScale(this._maxSpeed) : Vector.empty;
  }
}
