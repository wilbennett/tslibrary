import { Mat2, Vec2 } from '.';
import { Brush, Viewport } from '../../../../twod';

export interface IBody {
  position: Vec2;
  velocity: Vec2;

  angularVelocity: number;
  torque: number;
  orient: number;

  force: Vec2;

  I: number;
  iI: number;
  m: number;
  im: number;

  staticFriction: number;
  dynamicFriction: number;
  restitution: number;

  shape: Shape;
  brush: Brush;

  applyForce(f: Vec2): void;
  applyImpulse(impulse: Vec2, contactVector: Vec2): void;
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
