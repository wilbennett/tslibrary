import { IGeometry, ILine, IRay, ISegment } from '..';
import { Vector, VectorCollection, VectorGroups } from '../../vectors';

export interface IShape extends IGeometry {
  isWorld: boolean;
  readonly position: Vector;
  readonly angle: number;
  data: VectorGroups;
  vertices: VectorCollection;
  edgeVectors: VectorCollection;
  normals: VectorCollection;
  boundingShape?: Shape;

  setPosition(position: Vector): void;
  setAngle(radians: number): void;
  containsPoint(point: Vector): boolean;
  getSupport(direction: Vector, result?: Vector): Vector;
  getSupport(radians: number, result?: Vector): Vector;
  getAxes(other: Shape, result?: Vector[]): Vector[];
  toWorld(point: Vector, result?: Vector): Vector;
  toLocal(point: Vector, result?: Vector): Vector;
  toLocalOf(other: Shape, point: Vector, result?: Vector): Vector;
  createWorldShape(): this;
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
