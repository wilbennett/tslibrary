import { GroupAction } from '.';
import { ForceProcessParams } from '..';
import { dir, Vector } from '../../../vectors';

const desired = dir(0, 0);
const difference = dir(0, 0);
const target = dir(0, 0);

export class Cohesion extends GroupAction {
  maxDistance: number = 5;
  isProportional = true;

  protected calcDesiredVelocity(params: ForceProcessParams) {
    const { position } = params;

    const isProportional = this.isProportional;
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
    target.subO(position, desired);

    if (isProportional) {
      const distance = desired.mag;
      desired.normalizeScaleO(this.maxSpeed / (this.maxDistance - distance + 0.001));
    }

    return desired;
  }
}
