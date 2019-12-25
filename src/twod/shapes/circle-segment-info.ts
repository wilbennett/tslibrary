import { ICircleShape, LocalEdge, SupportPoint, SupportPointImpl, WorldEdge } from '.';
import { MathEx } from '../../core';
import { Vector } from '../../vectors';

class EdgeInfo {
  constructor(
    public index: number,
    public start: Vector,
    public end: Vector,
    public normal: Vector) {
  }
}

export class CircleSegmentInfo {
  constructor(segmentCount: number) {
    this.segmentCount = segmentCount;
  }

  private _segmentCount!: number;
  get segmentCount() { return this._segmentCount; }
  set segmentCount(value) {
    this._segmentCount = Math.max(value, 5);
    this._step = 360 / this._segmentCount * MathEx.ONE_DEGREE;
    this._cos = Math.cos(this._step);
    this._sin = Math.sin(this._step);
    this._ncos = Math.cos(-this._step);
    this._nsin = Math.sin(-this._step);

    this.populateValues(this._segmentCount);
  }

  private _step!: number;
  get step() { return this._step; }
  private _cos!: number;
  get cos() { return this._cos; }
  private _sin!: number;
  get sin() { return this._sin; }
  private _ncos!: number;
  get ncos() { return this._ncos; }
  private _nsin!: number;
  get nsin() { return this._nsin; }
  private _vertices!: Vector[];
  private _edges!: EdgeInfo[];

  // TODO: Support rotation in order to allow circle stacking.
  getVertex(index: number, center: Vector, radius: number) {
    return center.addScaledO(this._vertices[index], radius);
  }

  getEdgeVector(index: number, center: Vector, radius: number) {
    const nextIndex = (index + 1) % this._segmentCount;
    const vertex = this.getVertex(index, center, radius);
    const nextVertex = this.getVertex(nextIndex, center, radius);
    return nextVertex.subO(vertex);
  }

  getEdge(circle: ICircleShape, index: number, center: Vector, radius: number) {
    const edge = this._edges[index];
    const start = center.addScaledO(edge.start, radius);
    const end = center.addScaledO(edge.end, radius);
    return new LocalEdge(circle, index, start, end, this._edges[index].normal);
  }

  getWorldEdge(circle: ICircleShape, index: number, center: Vector, radius: number) {
    const edge = this._edges[index];
    const start = center.addScaledO(edge.start, radius);
    const end = center.addScaledO(edge.end, radius);
    return new WorldEdge(circle, index, start, end, this._edges[index].normal);
  }

  getNormal(index: number) { return this._edges[index].normal; }

  /*
  getSupportIndex(direction: Vector) {
    const segmentCount = this.segmentCount;
    const vertices = this._vertices;
    let low = 0;
    let high = segmentCount;

    while (low < high) {
      const middle = Math.floor((low + high) * 0.5);

      if (middle < 0 || middle > segmentCount - 1)
        debugger;

      if (vertices[middle].compareAngle(direction) > 0)
        high = middle;
      else
        low = middle + 1;
    }

    const index = low > 0 ? low - 1 : segmentCount - 1;
    return index;
  }
  /*/
  getSupport(circle: ICircleShape, direction: Vector, center: Vector, radius: number, result?: SupportPoint) {
    const segmentCount = this.segmentCount;
    const vertices = this._vertices;
    let low = 0;
    let high = segmentCount;

    while (low < high) {
      const middle = Math.floor((low + high) * 0.5);

      if (middle < 0 || middle > segmentCount - 1)
        debugger;

      if (vertices[middle].compareAngle(direction) > 0)
        high = middle;
      else
        low = middle + 1;
    }

    const index = low > 0 ? low - 1 : segmentCount - 1;
    result || (result = new SupportPointImpl(circle));
    result.clear();
    result.shape = circle;
    result.index = index;
    // support.direction = direction.clone();
    result.worldPoint = this.getVertex(index, center, radius);
    result.worldDirection = Vector.empty;
    return result;
  }
  //*/

  private populateValues(segmentCount: number) {
    const vertices = new Array<Vector>(segmentCount);
    const edges = new Array<EdgeInfo>(segmentCount);

    const cos = this._cos;
    const sin = this._sin;
    let offset = Vector.direction(1, 0);

    for (let i = 0; i < segmentCount; i++) {
      vertices[i] = offset.clone();

      let x = offset.x;
      let y = offset.y;
      let rx = x * cos - y * sin;
      let ry = x * sin + y * cos;
      offset.withXY(rx, ry);
    }

    for (let i = 0; i < segmentCount; i++) {
      const nextI = (i + 1) % segmentCount;
      const vertex = vertices[i];
      const nextVertex = vertices[nextI];

      const edge = new EdgeInfo(i, vertex, nextVertex, nextVertex.subO(vertex).perpRight().normalize());
      edges[i] = edge;
    }

    this._vertices = vertices;
    this._edges = edges;
  }
}

let circleSegmentInfo = new CircleSegmentInfo(30);

export function setCircleSegmentCount(value: number) { circleSegmentInfo.segmentCount = value; }
export function getCircleSegmentInfo() { return circleSegmentInfo; }
