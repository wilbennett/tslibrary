import { CircleSegmentInfo, Edge, GeometryIterator, getCircleSegmentInfo, ICircleShape, SupportPoint } from '.';
import { Vector } from '../../vectors';

export class CircleIterator implements GeometryIterator {
  constructor(readonly circle: ICircleShape, index: number, isWorld: boolean = false, segments?: CircleSegmentInfo) {
    this._index = index;
    this._center = isWorld ? circle.position : circle.center;
    this.segments = segments || getCircleSegmentInfo();

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
  }
  get vertexCount() { return this.segments.segmentCount; }
  protected _haveVertices = false;
  protected _vertices?: Vector[];
  get vertices(): Vector[] {
    if (!this._vertices || !this._haveVertices) {
      this._vertices = this.segments.getVertices(this._center, this.circle.radius);
      this._haveVertices = true;
    }

    return this._vertices;
  }
  get vertex() { return this.segments.getVertex(this.index, this._center, this.circle.radius); }
  get nextVertex() {
    const index = (this._index + 1) % this.segments.segmentCount;
    return this.segments.getVertex(index, this._center, this.circle.radius);
  }
  get prevVertex() {
    const index = this._index > 0 ? this._index - 1 : this.segments.segmentCount - 1;
    return this.segments.getVertex(index, this._center, this.circle.radius);
  }
  protected _haveEdgeVectors = false;
  protected _edgeVectors?: Vector[];
  get edgeVectors(): Vector[] {
    if (!this._edgeVectors || !this._haveEdgeVectors) {
      this._edgeVectors = this.segments.getEdgeVectors(this._center, this.circle.radius);
      this._haveEdgeVectors = true;
    }

    return this._edgeVectors;
  }

  get edge(): Edge {
    return this.isWorld
      ? this.segments.getWorldEdge(this.circle, this._index, this._center, this.circle.radius)
      : this.segments.getEdge(this.circle, this._index, this._center, this.circle.radius);
  }
  get prevEdge(): Edge {
    const index = this.index > 0 ? this.index - 1 : this.segments.segmentCount - 1;

    return this.isWorld
      ? this.segments.getWorldEdge(this.circle, index, this._center, this.circle.radius)
      : this.segments.getEdge(this.circle, index, this._center, this.circle.radius);
  }
  get edgeVector() { return this.nextVertex.subO(this.vertex); }
  get prevEdgeVector() { return this.vertex.subO(this.prevVertex); }
  get normalDirection() { return this.edgeVector.perpRight(); }
  get normal() { return this.normalDirection.normalize(); }

  reset(index: number = 0) {
    this._vertices = [];
    this._edgeVectors = [];
    this._haveVertices = false;
    this._haveEdgeVectors = false;
    this.index = index;
  }

  next() { this._index = (this._index + 1) % this.segments.segmentCount; }
  prev() { this._index = this._index > 0 ? this._index - 1 : this.segments.segmentCount - 1; }

  getSupport(direction: Vector, result?: SupportPoint): SupportPoint {
    return this.segments.getSupport(this.circle, direction, this.circle.center, this.circle.radius, result);
  }
}
