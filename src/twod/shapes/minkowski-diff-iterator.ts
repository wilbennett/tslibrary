import {
  CircleIterator,
  Edge,
  EdgeImpl,
  GeometryIterator,
  MinkowskiPoint,
  MinkowskiPointImpl,
  ShapeIterator,
  SupportPoint,
} from '.';
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

    this.iterA = this.shapeA.getIterator(start.indexA, true, this.circleSegments);
    this.iterB = this.shapeB.getIterator(start.indexB, true, this.circleSegments);
  }

  protected iterA: GeometryIterator;
  protected iterB: GeometryIterator;
  get iterator() {
    const edgeA = this.iterA.edgeVector;
    const edgeB = this.iterB.edgeVector.negateO();
    return edgeA.cross2D(edgeB) > 0 ? this.iterA : this.iterB;
  }
  get vertexCount() { return this.iterA.vertexCount + this.iterB.vertexCount; }

  get shape() {
    const edgeA = this.iterA.edgeVector;
    const edgeB = this.iterB.edgeVector.negateO();
    return edgeA.cross2D(edgeB) > 0 ? this.shapeA : this.shapeB;
  }
  // @ts-ignore - unused param.
  set shape(value) { }
  get index() {
    const edgeA = this.iterA.edgeVector;
    const edgeB = this.iterB.edgeVector.negateO();
    return edgeA.cross2D(edgeB) > 0 ? this.iterA.index : this.iterB.index;
  }
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
    this.indexA = start.indexA;
    this.indexB = start.indexB;
    this.worldDirection = start.worldDirection.clone();

    this.iterA.index = this.indexA;
    this.iterB.index = this.indexB;
  }

  clone(result?: SupportTypes): SupportTypes {
    if (!result) {
      result = new MinkowskiDiffIterator(this, this.circleSegments);
    } else {
      if (result instanceof MinkowskiDiffIterator) {
        const { iterA, iterB } = this;

        result.iterA = iterA instanceof CircleIterator
          ? new CircleIterator(iterA.circle, iterA.index, true, iterA.segments)
          : new ShapeIterator(this.shapeA, iterA.index, true);

        result.iterB = iterB instanceof CircleIterator
          ? new CircleIterator(iterB.circle, iterB.index, true, iterB.segments)
          : new ShapeIterator(this.shapeB, iterB.index, true);
      }
    }

    super.clone(result);
    return result;
  }

  getShapeEdge(): Edge {
    const edgeA = this.iterA.edgeVector;
    const edgeB = this.iterB.edgeVector.negateO();
    return edgeA.cross2D(edgeB) > 0 ? this.iterA.edge : this.iterB.edge;
  }

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
    const edgeA = this.iterA.edgeVector;
    const edgeB = this.iterB.edgeVector.negateO();

    if (edgeA.cross2D(edgeB) > 0) {
      this.worldPoint.add(edgeA);
      this.iterA.next();
    } else {
      this.worldPoint.add(edgeB);
      this.iterB.next();
    }

    this._worldPointA = undefined;
    this._worldPointB = undefined;
    return this.worldPoint;
  }

  prev() {
    const prevEdgeA = this.iterA.prevEdgeVector;
    const prevEdgeB = this.iterB.prevEdgeVector.negateO();

    if (prevEdgeA.cross2D(prevEdgeB) < 0) {
      this.worldPoint.displaceByNeg(prevEdgeA);
      this.iterA.prev();
    } else {
      this.worldPoint.displaceByNeg(prevEdgeB);
      this.iterB.prev();
    }

    this._worldPointA = undefined;
    this._worldPointB = undefined;
    return this.worldPoint;
  }
}
