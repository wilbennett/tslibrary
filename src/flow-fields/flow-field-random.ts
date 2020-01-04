import { FlowFieldBase } from '.';
import { MathEx } from '../core';
import { CircleSegmentInfo } from '../twod/shapes';
import { Vector } from '../vectors';

export class FlowFieldRandom extends FlowFieldBase {
  constructor(width: number, height: number, boundsSize: Vector) {
    super();

    this.width = width;
    this.height = height;
    this.boundsSize = boundsSize;
  }

  protected _circleSegments = new CircleSegmentInfo(360);

  protected generateDataCore(data: Vector[]) {
    const minSpeed = this._minSpeed;
    const maxSpeed = this._maxSpeed;
    const minIndex = Math.max(Math.round(this._minAngle * MathEx.ONE_RADIAN), 0);
    const maxIndex = Math.min(Math.round(this._maxAngle * MathEx.ONE_RADIAN), 359);
    const segments = this._circleSegments;
    const unitVectors = this.unitVectors;
    const count = data.length;

    for (let i = 0; i < count; i++) {
      const index = MathEx.randomInt(minIndex, maxIndex);
      const radius = unitVectors ? 1 : MathEx.randomInt(minSpeed, maxSpeed);
      segments.getVertexDirection(index, data[i]).scale(radius);
    }
  }
}
