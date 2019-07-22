import { ForcesApplier, Integrator } from '.';
import { DEFAULT_MATERIAL, MassInfo, TimeStep } from '../../core';
import { Vector } from '../../vectors';

export class EulerExplicit extends Integrator {
    get isNull() { return false; }
    private _isDirty = false;
    get isDirty() { return this._isDirty; }
    private _massInfo: MassInfo = MassInfo.empty;
    get massInfo() { return this._massInfo; }
    set massInfo(value) { this._massInfo = value; }
    private _material = DEFAULT_MATERIAL;
    get material() { return this._material; }
    set material(value) { this._material = value; }

    private _position = Vector.createPosition(0, 0);
    get position() { return this._position; }
    set position(value) {
        this._position = value;
        this.dirty();
    }

    private _velocity = Vector.createDirection(0, 0);
    get velocity() { return this._velocity; }
    private _acceleration = Vector.createDirection(0, 0);
    get acceleration() { return this._acceleration; }

    private _angle = 0;
    get angle() { return this._angle; }
    set angle(value) {
        this._angle = value;
        this.dirty();
    }

    private _angularVelocity = 0;
    get angularVelocity() { return this._angularVelocity; }
    private _angularAcceleration = 0;
    get angularAcceleration() { return this._angularAcceleration; }
    private _applyForces: ForcesApplier = () => { };
    get applyForces(): ForcesApplier { return this._applyForces; }
    set applyForces(value) { this._applyForces = value; }

    dirty() { this._isDirty = true; }
    clean() { this._isDirty = false; }

    private _force = Vector.createDirection(0, 0);
    private _torque = 0;

    applyForce(force: Vector) { this._force.add(force); }
    applyTorque(radians: number) { this._torque += radians; }

    applyImpulse(impulse: Vector, contactVector: Vector) {
        this._velocity.add(impulse.scaleN(this.massInfo.massInverse));
        this._angularVelocity += this.massInfo.inertiaInverse * contactVector.cross2D(impulse);
    }

    integrate(now: number, step: TimeStep) {
        const dt = step.dt;
        this.updateForces(now, this.position, this.velocity);

        this._acceleration = this._force.scale(this.massInfo.massInverse);
        this._position.addScaled(this._velocity, dt);
        this._velocity.addScaled(this._acceleration, dt);

        this._angularAcceleration += this._torque * this.massInfo.inertiaInverse;
        this._angle += this._angularVelocity * dt;
        this._angularVelocity += this._angularAcceleration * dt;
        this.dirty();
    }

    protected updateForces(now: number, position: Vector, velocity: Vector) {
        this._force.set(0, 0, 0, 0);
        this._torque = 0;
        this.applyForces(now, position, velocity);
    }
}
