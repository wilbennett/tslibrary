import { Integrator } from '.';
import { DEFAULT_MATERIAL, MassInfo } from '../../core';
import { Vector } from '../../vectors';
import { ForceSource } from '../forces';
import { Shape } from '../shapes';

export abstract class IntegratorBase extends Integrator {
  protected _shape!: Shape;
  get shape() { return this._shape; }
  set shape(value) { this._shape = value; }
  get isNull() { return false; }
  protected _isWorld?: boolean;
  get isWorld() { return !!this._isWorld; }
  set isWorld(value) { this._isWorld = value; }
  protected _massInfo: MassInfo = MassInfo.empty;
  get massInfo() { return this._massInfo; }
  set massInfo(value) { this._massInfo = value; }
  protected _material = DEFAULT_MATERIAL;
  get material() { return this._material; }
  set material(value) { this._material = value; }

  protected _position = Vector.position(0, 0);
  get position() { return this._position; }
  set position(value) { this._position = value; }

  protected _acceleration = Vector.direction(0, 0);
  get acceleration() { return this._acceleration; }
  protected _blockRotation = false;
  get blockRotationTransform() { return this._blockRotation; }
  set blockRotationTransform(value) { this._blockRotation = value; }
  protected _angle = 0;
  get angle() { return this._angle; }
  set angle(value) {
    this._angle = value;
    this.matrix.setAngle(value);
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

  protected _force = Vector.direction(0, 0);
  get force() { return this._force; }
  set force(value) { this._force = value; }
  protected _torque = 0;
  get torque() { return this._torque; }
  set torque(value) { this._torque = value; }

  applyForce(force: Vector) { this._force.add(force); }

  applyForceAt(worldPoint: Vector, force: Vector) {
    if (this.massInfo.massInverse === 0) return;

    const contactVector = worldPoint.subO(this._position);
    this._force.add(force);
    this._torque += contactVector.cross2D(force);
  }

  applyTorque(radians: number) { this._torque += radians; }

  protected clearForces(clearAngularForces: boolean = true) {
    this._force.set(0, 0, 0, 0);
    clearAngularForces && (this._torque = 0);
  }

  protected updateForces(now: number, position: Vector, velocity: Vector) {
    this.worldForces.forEach(force => force.process(this.shape, now, position, velocity));
    this.localForces.forEach(force => force.process(this.shape, now, position, velocity));
  }
}
