import { GeometryIterator, getCircleVertex, ICircle } from '.';
import { pos, Vector } from '../../vectors';
import { CircleSegmentInfo, getCircleSegmentInfo } from '../utils';

export class CircleIterator implements GeometryIterator {
  constructor(readonly circle: ICircle, index: number, isWorld: boolean = false, segments?: CircleSegmentInfo) {
    this._index = index;
    this._center = isWorld ? circle.position : circle.center;
    this.segments = segments || getCircleSegmentInfo();

    this._vertex = getCircleVertex(circle, index, isWorld, this.segments);

    if (isWorld)
      this._isWorld = isWorld;
  }

  protected _isWorld?: boolean;
  protected _center: Vector;
  readonly segments: CircleSegmentInfo;
  protected _index: number;
  get index() { return this._index; }
  set index(value) {
    if (this._index === value) return;

    this._index = value;
    this._vertex.copyFrom(getCircleVertex(this.circle, value, this._isWorld, this.segments));
  }
  protected _vertex: Vector;
  get vertexCount() { return this.segments.segmentCount; }
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
  get edgeVector() { return this.nextVertex.subO(this.vertex); }
  get prevEdgeVector() { return this.vertex.subO(this.prevVertex); }

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
}
