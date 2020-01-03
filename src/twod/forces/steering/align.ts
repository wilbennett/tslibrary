import { GroupAction } from '.';
import { ForceProcessParams } from '..';
import { dir, Vector } from '../../../vectors';

const desired = dir(0, 0);
const difference = dir(0, 0);

export class Align extends GroupAction {
  maxDistance: number = 5;

  protected calcDesiredVelocity(params: ForceProcessParams) {
    const { position } = params;

    const maxDistanceSquared = this.maxDistance * this.maxDistance;
    desired.withXY(0, 0);
    let count = 0;

    for (const shape of this._group!) {
      position.subO(shape.position, difference);
      const distanceSquared = difference.magSquared;

      if (distanceSquared === 0 || distanceSquared >= maxDistanceSquared) continue;

      desired.add(shape.velocity);
      count++;
    }

    return count > 0 ? desired.div(count).normalizeScale(this._maxSpeed) : Vector.empty;
  }
}
