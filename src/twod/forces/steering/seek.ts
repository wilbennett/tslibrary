import { ForceProcessParams } from '..';
import { TargetAction } from './target-action';

export class Seek extends TargetAction {
  protected calcDesiredVelocity(params: ForceProcessParams) {
    return this.calcDesiredSeekVelocity(params.position, this.target);
  }
}
