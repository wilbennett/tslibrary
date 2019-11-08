import { ContextProps, Viewport } from '..';
import { Tristate } from '../../core';
import { Vector } from '../../vectors';

export interface IGeometry {
  props: ContextProps;
  lineDash?: number[];

  containsPoint(point: Vector, epsilon?: number): boolean;
  getIntersectPoint(other: Geometry, result?: Vector): Tristate<Vector>;
  render(viewport: Viewport): void;
}

export interface ILine extends IGeometry {
  kind: "line";
  point: Vector;
  direction: Vector;
}

export interface IRay extends IGeometry {
  kind: "ray";
  start: Vector;
  direction: Vector;
}

export interface ISegment extends IGeometry {
  kind: "segment";
  start: Vector;
  end: Vector;
  edgeVector: Vector;
  direction: Vector;
}

export type Geometry = ILine | IRay | ISegment;
