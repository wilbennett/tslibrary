import { Projection, ShapeAxis, SupportPoint } from '.';
import { ContextProps, ICircle, IGeometry, ILine, Integrator, IRay, ISegment } from '..';
import { Tristate } from '../../core';
import { Vector, VectorCollection, VectorGroups } from '../../vectors';
import { IAABB, IPlane, IPolygon, IPolygonBase, ITriangle } from '../geometry';

export type SupportInfo = [Vector, number]; // Vertext, index.

export enum Winding {
  CCW = 1,
  CW = -1
}

export interface IShape extends IGeometry {
  isWorld: boolean;
  readonly integrators: Integrator[];
  angle: number;
  readonly data: VectorGroups;
  vertexList: VectorCollection;
  edgeVectorList: VectorCollection;
  normalList: VectorCollection;
  boundingShape?: Shape;
  hasDynamicAxes: boolean;
  props: ContextProps;

  getSupport(direction: Vector, result?: SupportPoint): Tristate<SupportPoint>;
  getSupport(axis: ShapeAxis, result?: SupportPoint): Tristate<SupportPoint>;
  getAxes(result?: ShapeAxis[]): ShapeAxis[];
  getDynamicAxes(other: Shape, result?: ShapeAxis[]): ShapeAxis[];
  createAxis(normal: Vector, result?: ShapeAxis): ShapeAxis;
  createWorldAxis(worldNormal: Vector, result?: ShapeAxis): ShapeAxis;
  projectOn(worldAxis: Vector, result?: Projection): Tristate<Projection>;
  toWorld(localPoint: Vector, result?: Vector): Vector;
  toLocal(worldPoint: Vector, result?: Vector): Vector;
  toLocalOf(other: Shape, localPoint: Vector, result?: Vector): Vector;
  // createWorldShape(): this;
}

export interface IMinkowskiShape extends IShape {
  kind: "minkowski";
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
  | IMinkowskiShape
  | IPlaneShape
  // | ILineShape
  // | IRayShape
  // | ISegmentShape
  | ICircleShape
  | IPolygonShape
  | IAABBShape
  | ITriangleShape
  ;
