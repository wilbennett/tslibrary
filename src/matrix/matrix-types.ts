import { CanvasContext } from '../twod';
import { Vector } from '../vectors';

export type MatrixValues = number[] | Float32Array;

export interface RotMatrix {
  setAngle(radians: number): void;
  transpose(): RotMatrix;
  transform(v: Vector, position: Vector, result?: Vector): Vector;
  transformInverse(v: Vector, position: Vector, result?: Vector): Vector;
  mult(other: RotMatrix): RotMatrix;
  setTransform(ctx: CanvasContext, position: Vector): void;
  updateTransform(ctx: CanvasContext, position: Vector): void;
}
