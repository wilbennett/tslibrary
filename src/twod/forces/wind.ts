import { ForceProcessParams, WindBase } from '.';
import { dir, Vector } from '../../vectors';
import { ShapePair } from '../collision';

export class Wind extends WindBase {
  constructor(speedDirection: Vector = dir(0, 0)) {
    super();

    this.speedDirection = speedDirection;
  }

  protected _speedSquared: number = 0;
  protected _direction: Vector = dir(0, 0);
  protected _speedDirection: Vector = dir(0, 0);
  get speedDirection() { return this._speedDirection; }
  set speedDirection(value) {
    this._speedDirection.withXY(value.x, value.y);
    this._speedDirection.normalizeO(this._direction);
    this._speedSquared = this._speedDirection.magSquared;
  }

  protected processCore(params: ForceProcessParams) {
    if (!this._shape) return Vector.empty;
    if (!this.collider) return Vector.empty;

    const { shape } = params;

    // TODO: Use ShapePairManager to cache.
    // const pair = new ShapePair(shape, this._shape);
    const pair = new ShapePair(this._shape, shape);
    this.collider.calcContact(pair);
    const contact = pair.contact;

    if (!contact.isCollision) return Vector.empty;

    return this.calculateForce(shape, contact, this._direction, this._speedSquared);
  }
}
