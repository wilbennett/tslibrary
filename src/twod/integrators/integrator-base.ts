import { Integrator } from '.';
import { DEFAULT_MATERIAL, MassInfo } from '../../core';
import { Vector } from '../../vectors';
import { ForceSource } from '../forces';

export class IntegratorBase extends Integrator {
  get isNull() { return false; }
  protected _isDirty = false;
  get isDirty() { return this._isDirty; }
  protected _massInfo: MassInfo = MassInfo.empty;
  get massInfo() { return this._massInfo; }
  set massInfo(value) { this._massInfo = value; }
  protected _material = DEFAULT_MATERIAL;
  get material() { return this._material; }
  set material(value) { this._material = value; }

  protected _position = Vector.position(0, 0);
  get position() { return this._position; }
  set position(value) {
    this._position = value;
    this.dirty();
  }

  protected _acceleration = Vector.direction(0, 0);
  get acceleration() { return this._acceleration; }

  protected _angle = 0;
  get angle() { return this._angle; }
  set angle(value) {
    this._angle = value;
    this.dirty();
  }

  protected _angularVelocity = 0;
  get angularVelocity() { return this._angularVelocity; }
  set angularVelocity(value) { this._angularVelocity = value; }
  protected _angularAcceleration = 0;
  get angularAcceleration() { return this._angularAcceleration; }
  protected _worldForces: ForceSource[] = [];
  get worldForces() { return this._worldForces; }
  set worldForces(value) { this._worldForces = value; }
  protected _localForces: ForceSource[] = [];
  get localForces() { return this._localForces; }
  set localForces(value) { this._localForces = value; }
  protected _restingSpeedCuttoff: number = 0;
  get restingSpeedCuttoff() { return this._restingSpeedCuttoff; }
  set restingSpeedCuttoff(value) { this._restingSpeedCuttoff = value; }

  dirty() { this._isDirty = true; }
  clean() { this._isDirty = false; }

  protected _force = Vector.direction(0, 0);
  get force() { return this._force; }
  set force(value) { this._force = value; }
  protected _torque = 0;
  get torque() { return this._torque; }
  set torque(value) { this._torque = value; }

  applyForce(force: Vector) { this._force.add(force); }
  applyTorque(radians: number) { this._torque += radians; }

  protected updateForces(now: number, position: Vector, velocity: Vector) {
    this._force.set(0, 0, 0, 0);
    this._torque = 0;

    this.worldForces.forEach(force => force.process(this, now, position, velocity));
    this.localForces.forEach(force => force.process(this, now, position, velocity));
  }
}
