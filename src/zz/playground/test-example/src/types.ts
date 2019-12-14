import { Mat2 } from '.';
import { Brush, Viewport } from '../../../../twod';
import { Vector } from '../../../../vectors';

export interface IBody {
  position: Vector;
  velocity: Vector;

  angularVelocity: number;
  torque: number;
  orient: number;

  force: Vector;

  I: number;
  iI: number;
  m: number;
  im: number;

  staticFriction: number;
  dynamicFriction: number;
  restitution: number;

  shape: Shape;
  brush: Brush;

  applyForce(f: Vector): void;
  applyImpulse(impulse: Vector, contactVector: Vector): void;
  setStatic(): void;
  setOrient(radians: number): void;
}

export interface IShape {
  body: IBody;
  radius: number;
  u: Mat2;

  clone(): Shape;
  initialize(): void;
  computeMass(density: number): void;
  setOrient(radians: number): void;
  draw(view: Viewport): void;
}

export interface ICircle extends IShape {
  kind: "circle";
}

export interface IPolygonShape extends IShape {
  kind: "poly";
}

export type Shape = ICircle | IPolygonShape;
