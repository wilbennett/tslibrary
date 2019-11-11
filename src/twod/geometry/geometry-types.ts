import { ContextProps, Viewport } from '..';
import { Tristate } from '../../core';
import { Vector, VectorCollection } from '../../vectors';

export interface IGeometry {
  props: ContextProps;

  containsPoint(point: Vector, epsilon?: number): boolean;
  closestPoint(point: Vector, hullOnly?: boolean, result?: Vector): Vector;
  getIntersectPoint(other: Geometry, result?: Vector): Tristate<Vector>;
  render(view: Viewport): void;
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

export interface ICircle extends IGeometry {
  kind: "circle";
  position: Vector;
  radius: number;
}

export interface IPolygon extends IGeometry {
  kind: "polygon";
  points: VectorCollection;
  position: Vector;
  radius: number;
  setPosition(position: Vector): void;
}

export interface ITriangle extends IGeometry {
  kind: "triangle";
  a: Vector;
  b: Vector;
  c: Vector;
  radius: number;
}

export type Geometry = ILine | IRay | ISegment | ICircle | IPolygon;
