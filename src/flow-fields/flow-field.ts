import { Vector } from '../vectors';

export type FlowRect = {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export interface FlowField {
  data: Vector[];
  width: number;
  height: number;
  minAngle: number;
  maxAngle: number;
  minSpeed: number;
  maxSpeed: number;
  boundsSize: Vector;
  readonly cellSize: Vector;

  getVector(col: number, row: number): Vector;
  getVectorForPoint(point: Vector): Vector;
  getCellRect(col: number, row: number): FlowRect;
  getCellRectForPoint(point: Vector): FlowRect;
  generate(): void;
}
