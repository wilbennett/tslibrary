import { ForceSourceBase } from '..';

export abstract class SteeringAction extends ForceSourceBase {
  weight = 1;
  protected _maxSpeed: number = 9;
  get maxSpeed() { return this._maxSpeed; }
  set maxSpeed(value) { this._maxSpeed = value; }
  protected _maxForce: number = 9;
  get maxForce() { return this._maxForce; }
  set maxForce(value) { this._maxForce = value; }
}
