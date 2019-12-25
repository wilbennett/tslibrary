import {
  CircleSegmentInfo,
  Edge,
  GeometryIterator,
  getCircleSegmentInfo,
  ICircleShape,
  LocalEdge,
  SupportPoint,
} from '.';
import { pos, Vector } from '../../vectors';
import { calcCircleSupport, calcCircleVertices, getCircleVertex } from './shape-utils';
import { WorldEdge } from './world-edge';

export class CircleIterator implements GeometryIterator {
  constructor(readonly circle: ICircleShape, index: number, isWorld: boolean = false, segments?: CircleSegmentInfo) {
    this._index = index;
    this._center = isWorld ? circle.position : circle.center;
    this.segments = segments || getCircleSegmentInfo();

    this._vertex = getCircleVertex(circle, index, isWorld, this.segments);
    this.isWorld = isWorld;
  }

  readonly isWorld: boolean;
  protected _center: Vector;
  readonly segments: CircleSegmentInfo;
  protected _index: number;
  get index() { return this._index; }
  set index(value) {
    // if (this._index === value) return; //! Need to recalc vertex in case center/position has changed.

    this._index = value;
    this._vertex.copyFrom(getCircleVertex(this.circle, value, this.isWorld, this.segments));
  }
  get vertexCount() { return this.segments.segmentCount; }
  get vertices(): Vector[] { return calcCircleVertices(this.circle, this.isWorld, this.segments); }
  protected _vertex: Vector;
  get vertex() { return this._vertex; }
  get nextVertex() {
    const current = this._vertex;
    const cx = this._center.x;
    const cy = this._center.y;
    const { sin, cos } = this.segments;

    let x = current.x - cx;
    let y = current.y - cy;
    let rx = x * cos - y * sin;
    let ry = x * sin + y * cos;

    return pos(rx + cx, ry + cy);
  }
  get prevVertex() {
    const current = this._vertex;
    const cx = this._center.x;
    const cy = this._center.y;
    const { nsin, ncos } = this.segments;

    let x = current.x - cx;
    let y = current.y - cy;
    let rx = x * ncos - y * nsin;
    let ry = x * nsin + y * ncos;

    return pos(rx + cx, ry + cy);
  }
  get edgeVectors(): Vector[] { return []; }

  get edge(): Edge {
    if (this.isWorld) {
      return new WorldEdge(
        this.circle,
        this.index,
        this.vertex.clone(),
        this.nextVertex,
        this.normal);
    }

    return new LocalEdge(
      this.circle,
      this.index,
      this.vertex.clone(),
      this.nextVertex,
      this.normal);
  }
  get prevEdge(): Edge {
    const index = this.index > 0 ? this.index - 1 : this.segments.segmentCount - 1;
    const vertex = this.vertex.clone();
    const prevVertex = this.prevVertex;
    const normal = vertex.subO(prevVertex).perpRight().normalize();

    if (this.isWorld) {
      return new WorldEdge(
        this.circle,
        index,
        prevVertex,
        vertex,
        normal);
    }

    return new LocalEdge(
      this.circle,
      index,
      prevVertex,
      vertex,
      normal);
  }
  get edgeVector() { return this.nextVertex.subO(this.vertex); }
  get prevEdgeVector() { return this.vertex.subO(this.prevVertex); }
  get normalDirection() { return this.edgeVector.perpRight(); }
  get normal() { return this.normalDirection.normalize(); }

  next() {
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
  }

  prev() {
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
  }

  getSupport(direction: Vector, result?: SupportPoint): SupportPoint {
    return calcCircleSupport(this.circle, direction, this.segments, result);
  }
}
