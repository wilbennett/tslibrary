import { ContextProps, ICircle, IGeometry, ILine, Integrator, IRay, ISegment } from '..';
import { Tristate } from '../../core';
import { Vector, VectorCollection, VectorGroups } from '../../vectors';
import { IAABB, IPolygon, IPolygonBase, ITriangle } from '../geometry';

export type SupportInfo = [Vector, number]; // Vertext, index.

export interface IShape extends IGeometry {
  isWorld: boolean;
  readonly integrators: Integrator[];
  position: Vector; // World space.
  angle: number;
  readonly data: VectorGroups;
  vertices: VectorCollection;
  edgeVectors: VectorCollection;
  normals: VectorCollection;
  boundingShape?: Shape;
  props: ContextProps;

  setPosition(position: Vector): void;
  getSupport(direction: Vector, result?: SupportInfo): Tristate<SupportInfo>; // Local space.
  getSupport(radians: number, result?: SupportInfo): Tristate<SupportInfo>;
  getAxes(other: Shape, result?: Vector[]): Vector[]; // Local space.
  toWorld(localPoint: Vector, result?: Vector): Vector;
  toLocal(worldPoint: Vector, result?: Vector): Vector;
  toLocalOf(other: Shape, localPoint: Vector, result?: Vector): Vector;
  // createWorldShape(): this;
}

export interface ILineShape extends IShape, ILine {
}

export interface IRayShape extends IShape, IRay {
}

export interface ISegmentShape extends IShape, ISegment {
}

export interface IPlaneShape extends IShape {
  kind: "plane";
  distance: number;
  normal: Vector;
}

export interface ICircleShape extends IShape, ICircle {
}

export interface IPolygonShapeBase extends IShape, IPolygonBase {
}

export interface IPolygonShape extends IPolygonShapeBase, IPolygon {
}

export interface IAABBShape extends IPolygonShapeBase, IAABB {
}

export interface ITriangleShape extends IPolygonShapeBase, ITriangle {
}

export type Shape =
  // | ILineShape
  // | IRayShape
  // | ISegmentShape
  // | IPlaneShape
  | ICircleShape
  | IPolygonShape
  | IAABBShape
  | ITriangleShape
  ;
