import { DEFAULT_MATERIAL, MassInfo, TimeStep } from '../../core';
import { Vector } from '../../vectors';

export type IntegratorConstructor = typeof Integrator;
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
  get acceleration() { return Vector.empty; }
  get angle() { return 0; }
  // @ts-ignore - unused param.
  set angle(value) { }
  get angularVelocity() { return 0; }
  get angularAcceleration() { return 0; }
  get applyForces(): ForcesApplier { return () => { }; }
  // @ts-ignore - unused param.
  set applyForces(value) { }

  dirty() { }
  clean() { }
  // @ts-ignore - unused param.
  applyForce(force: Vector) { }
  // @ts-ignore - unused param.
  applyTorque(radians: number) { }
  // @ts-ignore - unused param.
  applyImpulse(impulse: Vector, contactVector: Vector) { }
  // @ts-ignore - unused param.
  integrate(now: number, step: TimeStep) { }
}
