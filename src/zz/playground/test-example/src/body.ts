import { IBody, IEMath, Shape, Vec2 } from '.';
import { MathEx } from '../../../../core';
import { Brush } from '../../../../twod';

export class Body implements IBody {
  constructor(shape: Shape, x: number, y: number) {
    this.shape = shape.clone();
    this.shape.body = this;
    this.position = new Vec2(x, y);
    this.velocity = new Vec2(0, 0);
    this.angularVelocity = 0;
    this.torque = 0;
    this.orient = MathEx.random(-Math.PI, Math.PI);
    this.force = new Vec2(0, 0);
    this.staticFriction = 0.5;
    this.dynamicFriction = 0.3;
    this.restitution = 0.2;
    this.shape.initialize();
    this.brush = IEMath.randomBrush();
  }

  position: Vec2;
  velocity: Vec2;
  angularVelocity: number;
  torque: number;
  orient: number;
  force: Vec2;
  I: number = 0;
  iI: number = 0;
  m: number = 0;
  im: number = 0;
  staticFriction: number;
  dynamicFriction: number;
  restitution: number;

  shape: Shape;
  brush: Brush;

  applyForce(f: Vec2): void { this.force.add(f); }

  applyImpulse(impulse: Vec2, contactVector: Vec2): void {
    this.velocity.add(impulse.scaleO(this.im));
    this.angularVelocity += this.iI * contactVector.cross(impulse);
  }

  setStatic(): void {
    this.I = 0;
    this.iI = 0;
    this.m = 0;
    this.im = 0;
  }

  setOrient(radians: number): void {
    this.orient = radians;
    this.shape.setOrient(radians);
  }
}
