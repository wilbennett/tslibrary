import { Edge, GeometryIterator, ICircleShape, SupportPoint } from '.';
import { Vector } from '../../vectors';
import { CircleSegmentInfo, getCircleSegmentInfo } from '../utils';
import { EdgeImpl } from './edge-impl';
import { calcCircleSupport, calcCircleVerticesAndEdges } from './shape-utils';

export class CircleIterator implements GeometryIterator {
  constructor(readonly circle: ICircleShape, index: number, isWorld: boolean = false, segments?: CircleSegmentInfo) {
    this._index = index;
    this._center = isWorld ? circle.position : circle.center;
    this.segments = segments || getCircleSegmentInfo();

    // this._vertex = getCircleVertex(circle, index, isWorld, this.segments);
    // this._vertices = calcCircleVertices(circle, false, this.segments);
    [this._vertices, this._edgeVectors] = calcCircleVerticesAndEdges(circle, false, this.segments);

    if (isWorld)
      this.isWorld = isWorld;
  }

  protected isWorld?: boolean;
  protected _center: Vector;
  readonly segments: CircleSegmentInfo;
  protected _index: number;
  get index() { return this._index; }
  set index(value) {
    // if (this._index === value) return; //! Need to recalc vertex in case center/position has changed.

    this._index = value;
    // this._vertex.copyFrom(getCircleVertex(this.circle, value, this._isWorld, this.segments));
  }
  get vertexCount() { return this.segments.segmentCount; }
  protected _vertices: Vector[];
  get vertices(): Vector[] {
    return this.isWorld
      ? this._vertices.map(v => this.circle.toWorld(v))
      : this._vertices;
  }
  // protected _vertex: Vector;
  get vertex() {
    return this.isWorld
      ? this.circle.toWorld(this._vertices[this._index])
      : this._vertices[this._index];
  }
  // get vertex() { return this._vertex; }
  get nextVertex() {
    //*
    const index = (this._index + 1) % this.vertexCount;

    return this.isWorld
      ? this.circle.toWorld(this._vertices[index])
      : this._vertices[index];
    /*/
    const current = this._vertex;
    const cx = this._center.x;
    const cy = this._center.y;
    const { sin, cos } = this.segments;

    let x = current.x - cx;
    let y = current.y - cy;
    let rx = x * cos - y * sin;
    let ry = x * sin + y * cos;

    return pos(rx + cx, ry + cy);
    //*/
  }
  get prevVertex() {
    //*
    const index = this._index > 0 ? this._index - 1 : this.vertexCount - 1;

    return this.isWorld
      ? this.circle.toWorld(this._vertices[index])
      : this._vertices[index];
    /*/
    const current = this._vertex;
    const cx = this._center.x;
    const cy = this._center.y;
    const { nsin, ncos } = this.segments;

    let x = current.x - cx;
    let y = current.y - cy;
    let rx = x * ncos - y * nsin;
    let ry = x * nsin + y * ncos;

    return pos(rx + cx, ry + cy);
    //*/
  }
  protected readonly _edgeVectors: Vector[];
  get edgeVectors(): Vector[] {
    return this.isWorld
      ? this._edgeVectors.map(e => this.circle.toWorld(e))
      : this._edgeVectors;
  }
  get edge(): Edge {
    if (this.isWorld) {
      return new EdgeImpl(
        this.circle,
        this.index,
        undefined,
        undefined,
        this.vertex.clone(),
        this.nextVertex,
        undefined,
        undefined,
        undefined,
        this.normalDirection);
    }

    return new EdgeImpl(
      this.circle,
      this.index,
      this.vertex.clone(),
      this.nextVertex,
      undefined,
      undefined,
      undefined,
      undefined,
      this.normalDirection,
      undefined);
  }
  get prevEdge(): Edge {
    const index = this.index > 0 ? this.index - 1 : this.segments.segmentCount - 1;
    const vertex = this.vertex.clone();
    const prevVertex = this.prevVertex;
    const normalDirection = vertex.subO(prevVertex).perpRight();

    if (this.isWorld) {
      return new EdgeImpl(
        this.circle,
        index,
        undefined,
        undefined,
        prevVertex,
        vertex,
        undefined,
        undefined,
        undefined,
        normalDirection);
    }

    return new EdgeImpl(
      this.circle,
      index,
      prevVertex,
      vertex,
      undefined,
      undefined,
      undefined,
      undefined,
      normalDirection,
      undefined);
  }
  get edgeVector() {
    return this.isWorld
      ? this.circle.toWorld(this._edgeVectors[this._index])
      : this._edgeVectors[this._index];
  }
  get prevEdgeVector() {
    const index = this._index > 0 ? this._index - 1 : this.vertexCount - 1;

    return this.isWorld
      ? this.circle.toWorld(this._edgeVectors[index])
      : this._edgeVectors[index];
  }
  get normalDirection() { return this.edgeVector.perpRight(); }
  get normal() { return this.normalDirection.normalize(); }

  next() {
    //*/
    this._index = (this._index + 1) % this.segments.segmentCount;
    /*/
    const current = this._vertex;
    const cx = this._center.x;
    const cy = this._center.y;
    const { sin, cos } = this.segments;

    let x = current.x - cx;
    let y = current.y - cy;
    let rx = x * cos - y * sin;
    let ry = x * sin + y * cos;

    this._vertex.withXY(rx + cx, ry + cy);
    this._index = (this._index + 1) % this.segments.segmentCount;
    return this._vertex;
    //*/
  }

  prev() {
    //*
    this._index = this.index > 0 ? this.index - 1 : this.segments.segmentCount - 1;
    /*/
    const current = this._vertex;
    const cx = this._center.x;
    const cy = this._center.y;
    const { nsin, ncos } = this.segments;

    let x = current.x - cx;
    let y = current.y - cy;
    let rx = x * ncos - y * nsin;
    let ry = x * nsin + y * ncos;

    this._vertex.withXY(rx + cx, ry + cy);
    this._index = this._index > 0 ? this._index - 1 : this.segments.segmentCount - 1;
    return this._vertex;
    //*/
  }

  getSupport(direction: Vector, result?: SupportPoint): SupportPoint {
    return calcCircleSupport(this.circle, direction, this.segments, result);
  }
}
