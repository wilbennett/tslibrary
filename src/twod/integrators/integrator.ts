import { DEFAULT_MATERIAL, MassInfo, TimeStep } from '../../core';
import { Vector } from '../../vectors';

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
    get angularVelocity() { return 0; }
    get angularAcceleration() { return 0; }

    dirty() { }
    clean() { }
    reset() { }
    // @ts-ignore - unused param.
    applyForce(force: Vector): void { }
    // @ts-ignore - unused param.
    applyTorque(radians: number): void { }
    // @ts-ignore - unused param.
    applyImpulse(impulse: Vector, contactVector: Vector): void { }
    // @ts-ignore - unused param.
    integrate(timestep: TimeStep): void { }
}
