import { IBody, IEMath, Shape } from '.';
import { MathEx } from '../../../../core';
import { Brush } from '../../../../twod';
import { dir, pos, Vector } from '../../../../vectors';

export class Body implements IBody {
  constructor(shape: Shape, x: number, y: number) {
    this.shape = shape.clone();
    this.shape.body = this;
    this.position = pos(x, y);
    this.velocity = dir(0, 0);
    this.angularVelocity = 0;
    this.torque = 0;
    this.orient = MathEx.random(-Math.PI, Math.PI);
    this.force = dir(0, 0);
    this.staticFriction = 0.5;
    this.dynamicFriction = 0.3;
    this.restitution = 0.2;
    this.shape.initialize();
    this.brush = IEMath.randomBrush();
  }

  position: Vector;
  velocity: Vector;
  angularVelocity: number;
  torque: number;
  orient: number;
  force: Vector;
  I: number = 0;
  iI: number = 0;
  m: number = 0;
  im: number = 0;
  staticFriction: number;
  dynamicFriction: number;
  restitution: number;

  shape: Shape;
  brush: Brush;

  applyForce(f: Vector): void { this.force.add(f); }

  applyImpulse(impulse: Vector, contactVector: Vector): void {
    this.velocity.add(impulse.scaleO(this.im));
    this.angularVelocity += this.iI * contactVector.cross2D(impulse);
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
