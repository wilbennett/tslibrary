import { ForceProcessParams } from '..';
import { RangeMapper } from '../../../core';
import { dir, Vector } from '../../../vectors';
import { TargetAction } from './target-action';

const desired = dir(0, 0);

export class Flee extends TargetAction {
  constructor() {
    super();

    this._map = this.createMap();
  }
  protected _map: RangeMapper;
  isProportional = true;
  protected _radius: number = 10;
  get radius() { return this._radius; }
  set radius(value) {
    this._radius = value;
    this._map = this.createMap();
  }
  get maxSpeed() { return this._maxSpeed; }
  set maxSpeed(value) {
    this._maxSpeed = value;
    this._map = this.createMap();
  }

  protected calcDesiredVelocity(params: ForceProcessParams) {
    params.position.subO(this.target, desired);
    const radius = this.radius;

    if (desired.magSquared > radius * radius) return Vector.empty;

    if (this.isProportional) {
      const scale = this._map.convert(desired.mag);
      desired.normalizeScale(scale);
    } else {
      desired.normalizeScale(this._maxSpeed);
    }

    return desired;
  }

  protected createMap() { return new RangeMapper(0, this._radius, this.maxSpeed, 0); }
}
