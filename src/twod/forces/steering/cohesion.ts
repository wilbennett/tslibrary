import { GroupAction } from '.';
import { ForceProcessParams } from '..';
import { dir } from '../../../vectors';

const desired = dir(0, 0);
const difference = dir(0, 0);

export class Cohesion extends GroupAction {
  maxDistance: number = 5;

  protected calcDesiredVelocity(params: ForceProcessParams) {
    const { position } = params;

    const maxDistanceSquared = this.maxDistance * this.maxDistance;
    desired.withXY(0, 0);

    for (const shape of this._group!) {
      position.subO(shape.position, difference);
      const distanceSquared = difference.magSquared;

      if (distanceSquared === 0 || distanceSquared >= maxDistanceSquared) continue;

      desired.add(shape.position);
    }

    return desired.asCartesianDirection();
  }
}
