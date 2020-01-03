import { ForceProcessParams } from '..';
import { MathEx } from '../../../core';
import { dir, pos } from '../../../vectors';
import { CircleSegmentInfo, getCircleSegmentInfo } from '../../shapes';
import { TargetAction } from './target-action';

const nextPosition = dir(0, 0);
const velocityPixels = dir(0, 0);

export class Wander extends TargetAction {
  constructor() {
    super();

    this.circleSegments = getCircleSegmentInfo();
    this._target = pos(0, 0);
  }

  circleSegments: CircleSegmentInfo;
  radius: number = 15;
  stepCount = 25;
  protected _stepsRemain = 0;

  protected calcDesiredVelocity(params: ForceProcessParams) {
    const { position, velocity, step } = params;

    if (this._stepsRemain === 0) {
      const index = MathEx.randomInt(this.circleSegments.segmentCount - 1);
      position.addScaledO(velocity.toPixelsO(velocityPixels), step.dt, nextPosition);
      this.circleSegments.getVertex(index, nextPosition, this.radius, this.target);
      this._stepsRemain = this.stepCount;
    }

    this._stepsRemain--;
    return this.seek(this.target, position, true);
  }
}
