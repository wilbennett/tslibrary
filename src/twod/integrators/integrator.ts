import { CanvasContext } from '..';
import { DEFAULT_MATERIAL, MassInfo, TimeStep } from '../../core';
import { RotMat2D, RotMatrix } from '../../matrix';
import { Vector } from '../../vectors';
import { ForceSource } from '../forces';
import { Shape } from '../shapes';

export type IntegratorClass = typeof Integrator;
export type ForcesApplier = (now: number, position: Vector, velocity: Vector) => void;

export class Integrator {
  get isWorld() { return false; }
  // @ts-ignore - unused param.
  set isWorld(value) { }
  get isNull() { return true; }
  get massInfo() { return MassInfo.empty; }
  // @ts-ignore - unused param.
  set massInfo(value) { }
  get material() { return DEFAULT_MATERIAL; }
  // @ts-ignore - unused param.
  set material(value) { }
  get position() { return Vector.empty; }
  // @ts-ignore - unused param.
  set position(value) { }
  get velocity() { return Vector.empty; }
  // @ts-ignore - unused param.
  set velocity(value) { }
  get force() { return Vector.empty; }
  // @ts-ignore - unused param.
  set force(value) { }
  get acceleration() { return Vector.empty; }
  protected _matrix?: RotMatrix;
  protected get matrix() { return this._matrix || (this._matrix = new RotMat2D(this.angle)); }
  get angle() { return 0; }
  // @ts-ignore - unused param.
  set angle(value) { }
  get angularVelocity() { return 0; }
  // @ts-ignore - unused param.
  set angularVelocity(value) { }
  get torque() { return 0; }
  // @ts-ignore - unused param.
  set torque(value) { }
  get angularAcceleration() { return 0; }
  get worldForces(): ForceSource[] { return []; }
  // @ts-ignore - unused param.
  set worldForces(value) { }
  get localForces(): ForceSource[] { return []; }
  // @ts-ignore - unused param.
  set localForces(value) { }
  get restingSpeedCuttoff() { return 0; }
  // @ts-ignore - unused param.
  set restingSpeedCuttoff(value) { }
  get restingSpeedCuttoffSquared() { return this.restingSpeedCuttoff * this.restingSpeedCuttoff; }

  assignTo(other: Integrator) {
    other.position = this.position;
    other.angle = this.angle;
    other.velocity = this.velocity;
    other.angularVelocity = this.angularVelocity;
    other.material = this.material;
    other.massInfo = this.massInfo;
  }

  // @ts-ignore - unused param.
  applyForce(force: Vector) { }
  // @ts-ignore - unused param.
  applyTorque(radians: number) { }
  // @ts-ignore - unused param.
  applyImpulse(impulse: Vector, contactVector: Vector) { }
  // @ts-ignore - unused param.
  integrate(now: number, step: TimeStep) { }

  toWorld(localPoint: Vector, result?: Vector): Vector {
    if (this.isWorld)
      return result ? result.copyFrom(localPoint) : localPoint.clone();

    return this.matrix.transform(localPoint, this.position, result);
  }

  toLocal(worldPoint: Vector, result?: Vector): Vector {
    if (this.isWorld)
      return result ? result.copyFrom(worldPoint) : worldPoint.clone();

    return this.matrix.transformInverse(worldPoint, this.position, result);
  }

  toLocalOf(other: Shape | Integrator, localPoint: Vector, result?: Vector): Vector {
    return other instanceof Integrator
      ? other.toLocal(this.toWorld(localPoint, result), result)
      : other.integrator.toLocal(this.toWorld(localPoint, result), result);
  }

  setTransform(ctx: CanvasContext) { this.matrix.setTransform(ctx, this.position); }
  updateTransform(ctx: CanvasContext) { this.matrix.updateTransform(ctx, this.position); }
}
