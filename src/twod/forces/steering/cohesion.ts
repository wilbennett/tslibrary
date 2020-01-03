import { GroupAction } from '.';
import { ForceProcessParams } from '..';
import { dir, Vector } from '../../../vectors';

const difference = dir(0, 0);
const target = dir(0, 0);

export class Cohesion extends GroupAction {
  maxDistance: number = 5;
  isProportional = true;

  protected calcDesiredVelocity(params: ForceProcessParams) {
    const { position } = params;

    const maxDistanceSquared = this.maxDistance * this.maxDistance;
    target.withXY(0, 0);
    let count = 0;

    for (const shape of this._group!) {
      shape.position.subO(position, difference);
      const distanceSquared = difference.magSquared;

      if (distanceSquared === 0 || distanceSquared >= maxDistanceSquared) continue;

      target.add(shape.position);
      count++;
    }

    if (count === 0) return Vector.empty;

    target.asCartesianPosition();
    return this.seek(target, position, this.isProportional);
  }
}
