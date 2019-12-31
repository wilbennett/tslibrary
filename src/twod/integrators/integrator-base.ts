import { Integrator } from '.';
import { DEFAULT_MATERIAL, MassInfo, MathEx, TimeStep } from '../../core';
import { Vector } from '../../vectors';
import { ForceProcessParams, ForceSource } from '../forces';
import { Shape } from '../shapes';

let forceProcessParams: ForceProcessParams | undefined;

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
    this._angle = MathEx.wrapRadiansAbs(value);
    this.matrix.setAngle(value);
  }

  protected _angularVelocity = 0;
  get angularVelocity() { return this._angularVelocity; }
  set angularVelocity(value) { this._angularVelocity = value; }
  protected _angularAcceleration = 0;
  get angularAcceleration() { return this._angularAcceleration; }
  protected _angularDamping = 0.90;
  get angularDamping() { return this._angularDamping; }
  set angularDamping(value) { this._angularDamping = value; }
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

  integrate(now: number, step: TimeStep) {
    this.shape.removeExpiredForces(now);

    if (this.massInfo.massInverse === 0) return;

    this.integrateLinear(now, step);
    this.integrateAngular(now, step);

    this.clearForces();
  }

  // @ts-ignore - unused param.
  protected integrateLinear(now: number, step: TimeStep) {
  }

  // @ts-ignore - unused param.
  protected integrateAngular(now: number, step: TimeStep) {
    const dt = step.dt;

    this._angularAcceleration = this._torque * this.massInfo.inertiaInverse;
    this._angularVelocity += this._angularAcceleration * dt;
    this.angle += this._angularVelocity * Vector.pixelsPerMeter * dt;

    // this._angularVelocity > this.maxAngularVelocity * 0.5 && (this._angularVelocity *= this._angularDamping);
    this._angularAcceleration === 0 && this._angularVelocity > 0.5 && (this._angularVelocity *= this._angularDamping);
    this._angularVelocity = MathEx.clamp(this._angularVelocity, -this.maxAngularVelocity, this.maxAngularVelocity);
  }

  protected clearForces(clearAngularForces: boolean = true) {
    this._force.set(0, 0, 0, 0);
    clearAngularForces && (this._torque = 0);
  }

  protected updateForces(
    now: number,
    step: TimeStep,
    position: Vector,
    velocity: Vector,
    angle: number,
    angularVelocity: number) {
    const shape = this.shape;
    let params: ForceProcessParams;

    if (!forceProcessParams)
      params = (forceProcessParams = { shape, now, step, position, velocity, angle, angularVelocity });
    else {
      forceProcessParams.shape = shape;
      forceProcessParams.now = now;
      forceProcessParams.step = step;
      forceProcessParams.position = position;
      forceProcessParams.velocity = velocity;
      forceProcessParams.angle = angle;
      forceProcessParams.angularVelocity = angularVelocity;
      params = forceProcessParams;
    }

    this.worldForces.forEach(force => force.process(params));
    this.localForces.forEach(force => force.process(params));
  }
}
