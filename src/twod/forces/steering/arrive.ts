import { ForceProcessParams } from '..';
import { RangeMapper } from '../../../core';
import { dir } from '../../../vectors';
import { TargetAction } from './target-action';

const desired = dir(0, 0);

export class Arrive extends TargetAction {
  constructor() {
    super();

    this._map = this.createMap();
  }
  protected _map: RangeMapper;
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
    this.target.subO(params.position, desired);
    const radius = this.radius;

    if (desired.magSquared < radius * radius) {
      const scale = this._map.convert(desired.mag);
      desired.normalizeScale(scale);
    }

    return desired;
  }

  protected createMap() { return new RangeMapper(0, this._radius, 0, this.maxSpeed); }
}
