import { ForcesApplier, Integrator } from '.';
import { DEFAULT_MATERIAL, MassInfo } from '../../core';
import { Vector } from '../../vectors';

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
    protected _angularAcceleration = 0;
    get angularAcceleration() { return this._angularAcceleration; }
    protected _applyForces: ForcesApplier = () => { };
    get applyForces(): ForcesApplier { return this._applyForces; }
    set applyForces(value) { this._applyForces = value; }

    dirty() { this._isDirty = true; }
    clean() { this._isDirty = false; }

    protected _force = Vector.direction(0, 0);
    protected _torque = 0;

    applyForce(force: Vector) { this._force.add(force); }
    applyTorque(radians: number) { this._torque += radians; }

    protected updateForces(now: number, position: Vector, velocity: Vector) {
        this._force.set(0, 0, 0, 0);
        this._torque = 0;
        this.applyForces(now, position, velocity);
    }
}
