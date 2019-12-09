import { DEFAULT_MATERIAL, MassInfo, TimeStep } from '../../core';
import { Vector } from '../../vectors';
import { ForceSource } from '../forces';

export type IntegratorClass = typeof Integrator;
export type ForcesApplier = (now: number, position: Vector, velocity: Vector) => void;

export class Integrator {
  get isNull() { return true; }
  get isDirty() { return false; }
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
  get acceleration() { return Vector.empty; }
  get angle() { return 0; }
  // @ts-ignore - unused param.
  set angle(value) { }
  get angularVelocity() { return 0; }
  // @ts-ignore - unused param.
  set angularVelocity(value) { }
  get angularAcceleration() { return 0; }
  get worldForces(): ForceSource[] { return []; }
  // @ts-ignore - unused param.
  set worldForces(value) { }
  get localForces(): ForceSource[] { return []; }
  // @ts-ignore - unused param.
  set localForces(value) { }

  dirty() { }
  clean() { }

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
}
