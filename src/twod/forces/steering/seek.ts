import { ForceProcessParams } from '..';
import { dir } from '../../../vectors';
import { TargetAction } from './target-action';

const desired = dir(0, 0);

export class Seek extends TargetAction {
  protected calcDesiredVelocity(params: ForceProcessParams) {
    return this.target.subO(params.position, desired);
  }
}
