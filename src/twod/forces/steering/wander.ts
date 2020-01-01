import { ForceProcessParams } from '..';
import { MathEx } from '../../../core';
import { dir, pos } from '../../../vectors';
import { CircleSegmentInfo, getCircleSegmentInfo } from '../../shapes';
import { TargetAction } from './target-action';

const desired = dir(0, 0);

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
      const nextPosition = position.addScaledO(velocity.toPixelsO(), step.dt);
      this.target = this.circleSegments.getVertex(index, nextPosition, this.radius);
      this._stepsRemain = this.stepCount;
    }

    this._stepsRemain--;
    this.target.subO(position, desired);
    return desired;
  }
}
