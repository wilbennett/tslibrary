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
  protected _vertices = new Map<number, Vector>();
  get vertices(): Vector[] {
    if (!this._haveVertices) {
      const vertices = this.segments.getVertices(this._center, this.circle.radius);
      const map = this._vertices;
      vertices.forEach((v, i) => map.set(i, v));
      this._haveVertices = true;
    }

    return Array.from(this._vertices.values());
  }
  get vertex(): Vector {
    const vertices = this._vertices;
    const index = this.index;

    let result = vertices.get(index);

    if (result) return result;

    result = this.segments.getVertex(index, this._center, this.circle.radius);
    vertices.set(index, result);
    return result;
  }
  get nextVertex(): Vector {
    const vertices = this._vertices;
    const index = (this._index + 1) % this.segments.segmentCount;

    let result = vertices.get(index);

    if (result) return result;

    result = this.segments.getVertex(index, this._center, this.circle.radius);
    vertices.set(index, result);
    return result;
  }
  get prevVertex() {
    const vertices = this._vertices;
    const index = this._index > 0 ? this._index - 1 : this.segments.segmentCount - 1;

    let result = vertices.get(index);

    if (result) return result;

    result = this.segments.getVertex(index, this._center, this.circle.radius);
    vertices.set(index, result);
    return result;
  }
  protected _haveEdgeVectors = false;
  protected _edgeVectors = new Map<number, Vector>();
  get edgeVectors(): Vector[] {
    if (!this._haveEdgeVectors) {
      const edgeVectors = this.segments.getEdgeVectors(this._center, this.circle.radius);
      const map = this._edgeVectors;
      edgeVectors.forEach((v, i) => map.set(i, v));
      this._haveEdgeVectors = true;
    }

    return Array.from(this._edgeVectors.values());
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
  get edgeVector() {
    const edgeVectors = this._edgeVectors;
    const index = this.index;

    let result = edgeVectors.get(index);

    if (result) return result;

    result = this.nextVertex.subO(this.vertex);
    edgeVectors.set(index, result);
    return result;
  }
  get prevEdgeVector() {
    const edgeVectors = this._edgeVectors;
    const index = this.index > 0 ? this.index - 1 : this.segments.segmentCount - 1;

    let result = edgeVectors.get(index);

    if (result) return result;

    result = this.vertex.subO(this.prevVertex)
    edgeVectors.set(index, result);
    return result;
  }
  get normalDirection() { return this.edgeVector.perpRight(); }
  get normal() { return this.normalDirection.normalize(); }

  reset(index: number = 0) {
    this._vertices.clear();
    this._edgeVectors.clear();
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
