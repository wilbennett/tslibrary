import { CircleSegmentInfo, Projection, ShapeAxis, SupportPoint, WorldEdge } from '.';
import { ContextProps, ICircle, IGeometry, ILine, Integrator, IRay, ISegment, IWorld } from '..';
import { MassInfo, Material, Tristate } from '../../core';
import { Vector, VectorCollection, VectorGroups } from '../../vectors';
import { ForceSource } from '../forces';
import { IAABB, IPlane, IPolygon, IPolygonBase, ITriangle } from '../geometry';

export type SupportInfo = [Vector, number]; // Vertext, index.

export enum Winding {
  CCW = 1,
  CW = -1
}

export interface IShape extends IGeometry {
  isWorld: boolean;
  readonly integrator: Integrator;
  angle: number;
  readonly data: VectorGroups;
  vertexList: VectorCollection;
  edgeVectorList: VectorCollection;
  normalList: VectorCollection;
  boundingShape?: Shape;
  referenceShape?: Shape;
  usesReferenceShape: boolean; // e.g. plane can use another shape to determine vertices/edges.
  hasDynamicAxes: boolean;
  isCustomCollide: boolean;
  isCustomRender: boolean;

  velocity: Vector;
  massInfo: MassInfo;
  material: Material;

  props: ContextProps;

  initialize(world: IWorld): void;
  finalize(world: IWorld): void;
  getVertex(index: number): Vector; // Local;
  getVertices(): Vector[]; // Local;
  getEdgeVectors(): Vector[]; // Local;
  getFurthestEdges(worldDirection: Vector): WorldEdge[];
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
  getIterator(index: number, circleSegments?: CircleSegmentInfo): GeometryIterator;
  getWorldIterator(index: number, circleSegments?: CircleSegmentInfo): GeometryIterator;
  addAttachedForce(force: ForceSource, duration?: number): void;
  removeAttachedForce(force: ForceSource): void;
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
  end: Vector;
  normal: Vector;

  clone(result?: Edge): Edge;
}

export interface GeometryIterator {
  readonly isWorld: boolean;
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

  reset(index?: number): void;
  next(): void;
  prev(): void;
  getSupport(direction: Vector, result?: SupportPoint): SupportPoint; // Local.
}
