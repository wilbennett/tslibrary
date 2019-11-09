import { ContextProps, IGeometry, ILine, Integrator, IRay, ISegment } from '..';
import { Vector, VectorCollection, VectorGroups } from '../../vectors';

export type SupportInfo = [Vector, number]; // Vertext, index.

export interface IShape extends IGeometry {
  isWorld: boolean;
  readonly integrators: Integrator[];
  position: Vector; // World space.
  angle: number;
  readonly data: VectorGroups;
  vertices: VectorCollection | undefined;
  edgeVectors: VectorCollection | undefined;
  normals: VectorCollection | undefined;
  boundingShape?: Shape;
  props: ContextProps;

  setPosition(position: Vector): void;
  getSupport(direction: Vector, result?: SupportInfo): SupportInfo; // Local space.
  getSupport(radians: number, result?: SupportInfo): SupportInfo;
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

export interface ICircleShape extends IShape {
  kind: "circle";
  radius: number;
}

export interface IPolygonShape extends IShape {
  kind: "polygon";
}

export interface ITriangleShape extends IShape {
  kind: "triangle";
}

export interface IAABBShape extends IShape {
  kind: "aabb";
  halfSize: Vector;
  min: Vector;
  max: Vector;
}

export type Shape =
  // | ILineShape
  // | IRayShape
  // | ISegmentShape
  // | IPlaneShape
  | ICircleShape
  // | IPolygonShape
  // | ITriangleShape
  // | IAABBShape
  ;
