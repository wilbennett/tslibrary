import { Projection, ShapeAxis, SupportPoint } from '.';
import { ContextProps, ICircle, IGeometry, ILine, Integrator, IRay, ISegment } from '..';
import { Tristate } from '../../core';
import { Vector, VectorCollection, VectorGroups } from '../../vectors';
import { IAABB, IPlane, IPolygon, IPolygonBase, ITriangle } from '../geometry';
import { CircleSegmentInfo } from '../utils';

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
  referenceShape?: Shape;
  usesReferenceShape: boolean; // e.g. plane can use another shape to determine vertices/edges.
  hasDynamicAxes: boolean;
  props: ContextProps;

  getVertex(index: number): Vector; // Local;
  getVertices(): Vector[]; // Local;
  getEdgeVectors(): Vector[]; // Local;
  getFurthestEdges(worldDirection: Vector): Edge[];
  getSupport(direction: Vector, result?: SupportPoint): SupportPoint; // Local.
  getSupportFromAxis(axis: ShapeAxis, result?: SupportPoint): SupportPoint;
  getAxes(result?: ShapeAxis[]): ShapeAxis[];
  getDynamicAxes(other: Shape, result?: ShapeAxis[]): ShapeAxis[];
  createAxis(normal: Vector, result?: ShapeAxis): ShapeAxis;
  createWorldAxis(worldNormal: Vector, result?: ShapeAxis): ShapeAxis;
  projectOn(worldAxis: Vector, result?: Projection): Tristate<Projection>;
  toWorld(localPoint: Vector, result?: Vector): Vector;
  toLocal(worldPoint: Vector, result?: Vector): Vector;
  toLocalOf(other: Shape, localPoint: Vector, result?: Vector): Vector;
  getIterator(index: number, isWorld?: boolean, circleSegments?: CircleSegmentInfo): GeometryIterator;
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

export interface Edge {
  shape: Shape;
  index: number;
  start: Vector;
  worldStart: Vector;
  end: Vector;
  worldEnd: Vector;
  normalDirection: Vector;
  worldNormalDirection: Vector;
  normal: Vector;
  worldNormal: Vector;

  clear(): void;
  clone(result?: Edge): Edge;
}

export interface GeometryIterator {
  index: number;
  readonly vertexCount: number;
  readonly vertices: Vector[];
  readonly vertex: Vector;
  readonly nextVertex: Vector;
  readonly prevVertex: Vector;
  readonly edgeVectors: Vector[];
  readonly edge: Edge;
  readonly prevEdge: Edge;
  readonly edgeVector: Vector;
  readonly prevEdgeVector: Vector;
  readonly normalDirection: Vector;
  readonly normal: Vector;

  next(): void;
  prev(): void;
}
