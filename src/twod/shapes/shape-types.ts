import { ContextProps, ICircle, IGeometry, ILine, Integrator, IRay, ISegment } from '..';
import { Tristate } from '../../core';
import { Vector, VectorCollection, VectorGroups } from '../../vectors';
import { IAABB, IPlane, IPolygon, IPolygonBase, ITriangle } from '../geometry';

export type SupportInfo = [Vector, number]; // Vertext, index.

export interface IShape extends IGeometry {
  isWorld: boolean;
  readonly integrators: Integrator[];
  angle: number;
  readonly data: VectorGroups;
  vertexList: VectorCollection;
  edgeVectorList: VectorCollection;
  normalList: VectorCollection;
  boundingShape?: Shape;
  props: ContextProps;

  getSupport(direction: Vector, result?: Vector): Tristate<number | Vector>; // Local space.
  // TODO: Check if binary searching angle is faster than searching by dot product.
  // getSupport(radians: number, result?: Vector): Tristate<number | Vector>;
  getSupportPoint(direction: Vector, result?: Vector): Tristate<Vector>; // Local space.
  // getSupportPoint(radians: number, result?: Vector): Tristate<Vector>;
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

export interface IPlaneShape extends IShape, IPlane {
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
  // | IPlaneShape
  // | ILineShape
  // | IRayShape
  // | ISegmentShape
  | ICircleShape
  | IPolygonShape
  | IAABBShape
  | ITriangleShape
  ;
