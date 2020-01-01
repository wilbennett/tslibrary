import { GroupAction } from '.';
import { ForceProcessParams } from '..';
import { dir, Vector } from '../../../vectors';

const desired = dir(0, 0);
const difference = dir(0, 0);

export class Separate extends GroupAction {
  minDistance: number = 3;

  protected calcDesiredVelocity(params: ForceProcessParams) {
    const { position } = params;

    const minDistanceSquared = this.minDistance * this.minDistance;
    desired.withXY(0, 0);
    let count = 0;

    for (const shape of this._group!) {
      position.subO(shape.position, difference);
      const distanceSquared = difference.magSquared;

      if (distanceSquared === 0 || distanceSquared >= minDistanceSquared) continue;

      difference.normalizeScale(Math.sqrt(distanceSquared));
      desired.add(difference);
      count++;
    }

    return count > 0 ? desired.div(count) : Vector.empty;
  }
}
