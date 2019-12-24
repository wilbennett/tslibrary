import {
  Edge,
  EdgeImpl,
  GeometryIterator,
  MinkowskiPoint,
  MinkowskiPointImpl,
  Shape,
  SupportPoint,
  SupportPointImpl,
} from '.';
import { Vector } from '../../vectors';
import { CircleSegmentInfo } from '../utils';

type SupportTypes = SupportPoint | MinkowskiPoint | MinkowskiDiffIterator;

export class MinkowskiDiffIterator extends MinkowskiPointImpl implements GeometryIterator {
  constructor(start: MinkowskiPoint, circleSegments?: CircleSegmentInfo) {
    super(
      start.shapeA,
      start.shapeB,
      start.worldPoint.clone(),
      start.indexA,
      start.indexB,
      start.worldDirection.clone(),
      circleSegments);

    this.iterA = this.shapeA.getWorldIterator(start.indexA, this.circleSegments);
    this.iterB = this.shapeB.getWorldIterator(start.indexB, this.circleSegments);

    this.init(start);
  }

  get isWorld() { return true; }
  protected iterA: GeometryIterator;
  protected iterB: GeometryIterator;
  protected _iterator?: GeometryIterator;
  get iterator() {
    if (!this._iterator) {
      const iterA = this.iterA;
      const iterB = this.iterB;
      let edgeA = iterA.edgeVector;
      let edgeB = iterB.edgeVector.negateO();

      if (edgeA.cross2D(edgeB) > 0) {
        this._iterator = iterA;
        this._shape = this.shapeA;
      } else {
        this._iterator = iterB;
        this._shape = this.shapeB;
      }
    }

    return this._iterator;
  }
  get vertexCount() { return this.iterA.vertexCount + this.iterB.vertexCount; }
  get vertices(): Vector[] { return []; }
  protected _shape?: Shape;
  get shape() {
    if (!this._shape) {
      this._shape = this.iterator === this.iterA ? this.shapeA : this.shapeB;
    }

    return this._shape;
  }
  // @ts-ignore - unused param.
  set shape(value) { }
  get index() { return this.iterator.index; }
  // @ts-ignore - unused param.
  set index(value) { }
  get indexA() { return this.iterA.index; }
  set indexA(value) { this.iterA.index = value; }
  get indexB() { return this.iterB.index; }
  set indexB(value) { this.iterB.index = value; }
  get vertex() { return this.worldPoint; }
  get nextVertex() {
    const edgeA = this.iterA.edgeVector;
    const edgeB = this.iterB.edgeVector.negateO();

    return edgeA.cross2D(edgeB) > 0
      ? this.worldPoint.addO(edgeA)
      : this.worldPoint.addO(edgeB);
  }
  get prevVertex() {
    const prevEdgeA = this.iterA.prevEdgeVector;
    const prevEdgeB = this.iterB.prevEdgeVector.negateO();

    return prevEdgeA.cross2D(prevEdgeB) < 0
      ? this.worldPoint.displaceByNegO(prevEdgeA)
      : this.worldPoint.displaceByNegO(prevEdgeB);
  }
  get edgeVectors(): Vector[] { return []; }
  get edge(): Edge {
    // TODO: Need to fix this.
    return new EdgeImpl(this.shape, NaN);
  }
  get prevEdge(): Edge {
    // TODO: Need to fix this.
    return new EdgeImpl(this.shape, NaN);
  }
  get edgeVector() { return this.nextVertex.subO(this.vertex); }
  get prevEdgeVector() { return this.vertex.subO(this.prevVertex); }
  get normalDirection() { return this.edgeVector.perpRight(); }
  get normal() { return this.normalDirection.normalize(); }

  init(start: MinkowskiPoint) {
    this.worldPoint = start.worldPoint.clone();
    this.worldDirection = start.worldDirection.clone();

    this.iterA.index = start.indexA;
    this.iterB.index = start.indexB;

    this._shape = undefined;
    this._iterator = undefined;
  }

  clone(result?: SupportTypes): SupportTypes {
    if (!result) {
      result = new MinkowskiDiffIterator(this, this.circleSegments);
    } else {
      if (result instanceof MinkowskiDiffIterator) {
        const { iterA, iterB } = this;
        this.shapeA.usesReferenceShape && (this.shapeA.referenceShape = this.shapeB);
        this.shapeB.usesReferenceShape && (this.shapeB.referenceShape = this.shapeA);

        result.iterA = this.shapeA.getWorldIterator(iterA.index, this.circleSegments);
        result.iterB = this.shapeB.getWorldIterator(iterB.index, this.circleSegments);
      }
    }

    super.clone(result);
    result instanceof MinkowskiDiffIterator && result.init(this);
    return result;
  }

  getShapeEdge(): Edge { return this.iterator.edge; }

  getNextShapeEdge(): Edge {
    const { iterA, iterB } = this;
    let edgeA = iterA.edgeVector;
    let edgeB = iterB.edgeVector.negateO();

    let advancedA = false;
    let edge: Edge;

    if (edgeA.cross2D(edgeB) > 0) {
      iterA.next();
      advancedA = true;
      edgeA = iterA.edgeVector;
    } else {
      iterB.next();
      iterB.edgeVector.negateO(edgeB);
    }

    edge = edgeA.cross2D(edgeB) > 0 ? iterA.edge : iterB.edge;

    if (advancedA)
      iterA.prev();
    else
      iterB.prev();

    return edge;
  }

  next() {
    const iterA = this.iterA;
    const iterB = this.iterB;
    let edgeA = iterA.edgeVector;
    let edgeB = iterB.edgeVector.negateO();

    if (edgeA.cross2D(edgeB) > 0) {
      this.worldPoint.add(edgeA);
      iterA.next();
    } else {
      this.worldPoint.add(edgeB);
      iterB.next();
    }

    this._shape = undefined;
    this._iterator = undefined;
    this._worldPointA = undefined;
    this._worldPointB = undefined;
    return this.worldPoint;
  }

  prev() {
    const iterA = this.iterA;
    const iterB = this.iterB;
    const edgeA = iterA.prevEdgeVector;
    const edgeB = iterB.prevEdgeVector.negateO();

    if (edgeA.cross2D(edgeB) < 0) {
      this.worldPoint.displaceByNeg(edgeA);
      iterA.prev();
    } else {
      this.worldPoint.displaceByNeg(edgeB);
      iterB.prev();
    }

    this._shape = undefined;
    this._iterator = undefined;
    this._worldPointA = undefined;
    this._worldPointB = undefined;
    return this.worldPoint;
  }

  // @ts-ignore - unused param.
  getSupport(direction: Vector, result?: SupportPoint): SupportPoint {
    result || (result = new SupportPointImpl(this.shape));
    result.shape = this.shape;
    result.point = this.point;
    result.index = 0;
    result.distance = NaN;
    result.direction = Vector.empty;
    return result;
  }
}
