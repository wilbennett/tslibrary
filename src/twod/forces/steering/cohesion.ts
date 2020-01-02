import { GroupAction } from '.';
import { ForceProcessParams } from '..';
import { dir, Vector } from '../../../vectors';

const desired = dir(0, 0);
const difference = dir(0, 0);

export class Cohesion extends GroupAction {
  maxDistance: number = 5;
  isProportional = true;

  protected calcDesiredVelocity(params: ForceProcessParams) {
    const { position } = params;

    const isProportional = this.isProportional;
    const maxDistanceSquared = this.maxDistance * this.maxDistance;
    desired.withXY(0, 0);
    let count = 0;

    for (const shape of this._group!) {
      position.subO(shape.position, difference);
      const distanceSquared = difference.magSquared;

      if (distanceSquared === 0 || distanceSquared >= maxDistanceSquared) continue;

      isProportional && difference.normalizeScale(1 / difference.mag);
      desired.add(difference);
      count++;
    }

    return count > 0 ? desired.div(count) : Vector.empty;
  }
}
