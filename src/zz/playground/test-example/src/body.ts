import { IBody, IEMath } from '.';
import { MassInfo, MathEx } from '../../../../core';
import { Brush } from '../../../../twod';
import { Shape } from '../../../../twod/shapes';
import { pos, Vector } from '../../../../vectors';

export class Body implements IBody {
  constructor(shape: Shape, x: number, y: number) {
    this.shape = shape;
    this.shape.setPosition(pos(x, y));
    this.orient = MathEx.random(-Math.PI, Math.PI);
    this.brush = IEMath.randomBrush();

    this.shape.props = { strokeStyle: this.brush, lineWidth: 2 };
  }

  get position() { return this.shape.position; }
  set position(value) { this.shape.position = value; }
  get velocity() { return this.shape.velocity; }
  set velocity(value) { this.shape.velocity = value; }
  get angularVelocity() { return this.shape.integrator.angularVelocity; }
  set angularVelocity(value) { this.shape.integrator.angularVelocity = value; }
  get torque() { return this.shape.integrator.torque; }
  set torque(value) { this.shape.integrator.torque = value; }
  get orient() { return this.shape.angle; }
  set orient(value) { this.shape.angle = value; }
  get force() { return this.shape.integrator.force; }
  set force(value) { this.shape.integrator.force = value; }
  get I() { return this.shape.massInfo.inertia; }
  set I(value) { this.shape.massInfo = new MassInfo(this.shape.massInfo.mass, value); }
  get m() { return this.shape.massInfo.mass; }
  set m(value) { this.shape.massInfo = new MassInfo(value, this.shape.massInfo.inertia); }
  get iI() { return this.shape.massInfo.inertiaInverse; }
  get im() { return this.shape.massInfo.massInverse; }
  get staticFriction() { return this.shape.material.staticFriction; }
  get dynamicFriction() { return this.shape.material.kineticFriction; }
  get restitution() { return this.shape.material.restitution; }

  shape: Shape;
  brush: Brush;

  applyForce(f: Vector): void { this.force.add(f); }

  applyImpulse(impulse: Vector, contactVector: Vector): void {
    this.velocity.add(impulse.scaleO(this.im));
    this.angularVelocity += this.iI * contactVector.cross2D(impulse);
  }

  setStatic(): void { this.shape.massInfo = MassInfo.empty; }
  setOrient(radians: number): void { this.orient = radians; }
}
