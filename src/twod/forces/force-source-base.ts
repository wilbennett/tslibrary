import { ForceProcessParams, ForceSource } from '.';
import { IWorld } from '..';
import { pos, Vector } from '../../vectors';
import { Collider } from '../collision';
import { Shape } from '../shapes';

export abstract class ForceSourceBase implements ForceSource {
  startTime: number = 0;
  endTime: number = Infinity;
  protected _shape?: Shape;
  get shape() { return this._shape; }
  set shape(value) { this._shape = value; }
  protected _position: Vector = pos(0, 0);
  get position() { return this._shape?.position || this._position; }
  set position(value) {
    if (this._shape)
      this._shape.position = value;
    else
      this._position = value;
  }
  protected _world?: IWorld;
  protected _collider?: Collider;
  protected get collider() {
    const world = this._world;
    return this._collider || (this._collider = world?.broadPhase?.collider ?? world?.narrowPhase?.collider);
  }

  initialize(world: IWorld) {
    this._world = world;
  }

  // @ts-ignore - unused param.
  finalize(world: IWorld) {
    this._world = undefined;
    this._collider = undefined;
  }

  isActive(time: number) { return time >= this.startTime && time <= this.endTime; }
  isExpired(time: number) { return time > this.endTime; }

  setPosition(position: Vector) {
    if (this._shape)
      this._shape.setPosition(position);
    else
      this._position.withXY(position.x, position.y);
  }

  protected abstract processCore(params: ForceProcessParams): void;

  process(params: ForceProcessParams) {
    if (!this.isActive(params.now)) return;
    if (this.isExpired(params.now)) return;

    this.processCore(params);
  }
}
