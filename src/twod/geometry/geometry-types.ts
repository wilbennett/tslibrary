import { ContextProps, Viewport } from '..';
import { Tristate } from '../../core';
import { Vector, VectorCollection } from '../../vectors';

export interface IPositioned {
  position: Vector;
  setPosition(position: Vector): void;
}

export interface IGeometry {
  props: ContextProps;

  containsPoint(point: Vector, epsilon?: number): boolean;
  closestPoint(point: Vector, hullOnly?: boolean, result?: Vector): Vector;
  getIntersectPoint(other: Geometry, result?: Vector): Tristate<Vector>;
  render(view: Viewport): void;
}

export interface IPlane extends IGeometry {
  kind: "plane";
  readonly normal: Vector;
  distance: number;
  position: Vector; // Calculated.
  direction: Vector; // Calculated.
}

export interface ILine extends IGeometry, IPositioned {
  kind: "line";
  readonly normal: Vector;
  direction: Vector; // Calculated.
}

export interface IRay extends IGeometry {
  kind: "ray";
  position: Vector;
  direction: Vector;
}

export interface ISegment extends IGeometry, IPositioned {
  kind: "segment";
  start: Vector;
  end: Vector;
  edgeVector: Vector; // Calculated.
  direction: Vector; // Calculated.
}

export interface ICircle extends IGeometry {
  kind: "circle";
  position: Vector;
  radius: number;
}

export interface IPolygonBase extends IGeometry, IPositioned {
  vertices: VectorCollection;
  radius: number;
}

export interface IPolygon extends IPolygonBase {
  kind: "polygon";
}

export interface IAABB extends IPolygonBase {
  kind: "aabb";
  halfSize: Vector;
  min: Vector; // Calculated.
  max: Vector; // Calculated.
}

export interface ITriangle extends IPolygonBase {
  kind: "triangle";
}

export type Geometry =
  | IPlane
  | ILine
  | IRay
  | ISegment
  | ICircle
  | IPolygon
  | IAABB
  | ITriangle;
