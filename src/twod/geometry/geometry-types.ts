import { ContextProps, Viewport } from '..';
import { Tristate } from '../../core';
import { Vector, VectorCollection } from '../../vectors';

export interface IPositioned {
  position: Vector;
  setPosition(position: Vector): void;
}

export interface IGeometry extends IPositioned {
  props: ContextProps;

  containsPoint(point: Vector, epsilon?: number): boolean;
  closestPoint(point: Vector, hullOnly?: boolean, result?: Vector): Vector;
  getIntersectPoint(other: Geometry, result?: Vector): Tristate<Vector>;
  render(view: Viewport): void;
}

export interface IPlane extends IGeometry {
  kind: "plane";
  readonly normal: Vector; // Should not modify externally.
  distance: number; // Should not modify externally.
  readonly direction: Vector; // Calculated.
}

export interface ILine extends IGeometry {
  kind: "line";
  readonly normal: Vector; // Should not modify externally.
  readonly direction: Vector; // Calculated.
}

export interface IRay extends IGeometry {
  kind: "ray";
  readonly direction: Vector; // Should not modify externally.
}

export interface ISegment extends IGeometry {
  kind: "segment";
  readonly start: Vector; // Should not modify externally.
  readonly end: Vector; // Should not modify externally.
  readonly edgeVector: Vector; // Calculated.
  readonly direction: Vector; // Calculated.
}

export interface ICircle extends IGeometry {
  kind: "circle";
  readonly radius: number;
}

export interface IPolygonBase extends IGeometry {
  vertexList: VectorCollection;
  radius: number; // Should not modify externally.
}

export interface IPolygon extends IPolygonBase {
  kind: "polygon";
}

export interface IAABB extends IPolygonBase {
  kind: "aabb";
  halfSize: Vector; // Should not modify externally.
  readonly min: Vector; // Calculated.
  readonly max: Vector; // Calculated.
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
