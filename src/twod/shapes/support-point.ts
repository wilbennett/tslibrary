import { Shape } from '.';
import { Vector } from '../../vectors';

export interface SupportPoint {
  shape: Shape;
  point: Vector;
  worldPoint: Vector;
  direction: Vector;
  worldDirection: Vector;
  index: number;
  distance: number;
  isValid: boolean;

  clear(): void;
  clone(result?: SupportPoint): SupportPoint;
}
