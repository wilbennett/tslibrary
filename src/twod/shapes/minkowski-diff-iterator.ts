import { MinkowskiPoint, MinkowskiPointImpl, Shape, ShapeIterator, SupportPoint } from '.';
import { Vector } from '../../vectors';
import { CircleIterator, GeometryIterator } from '../geometry';
import { CircleSegmentInfo } from '../utils';

export type Edge = {
  shape: Shape;
  index: number;
  start: Vector;
  end: Vector;
}

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

    this.iterA = this.shapeA.kind === "circle"
      ? new CircleIterator(this.shapeA, start.indexA, true, this.circleSegments)
      : new ShapeIterator(this.shapeA, start.indexA, true);

    this.iterB = this.shapeB.kind === "circle"
      ? new CircleIterator(this.shapeB, start.indexB, true, this.circleSegments)
      : new ShapeIterator(this.shapeB, start.indexB, true);
  }

  protected iterA: GeometryIterator;
  protected iterB: GeometryIterator;
  get vertexCount() { return this.iterA.vertexCount + this.iterB.vertexCount; }

  get index() { return NaN; }
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
  get edgeVector() { return this.nextVertex.subO(this.vertex); }
  get prevEdgeVector() { return this.vertex.subO(this.prevVertex); }

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

    let shape = this.shapeA;
    let index: number;
    let start: Vector;
    let end: Vector;

    if (edgeA.cross2D(edgeB) > 0) {
      index = this.iterA.index;
      start = this.worldPointA;
      end = start.addO(edgeA);
    } else {
      shape = this.shapeB;
      index = this.iterB.index;
      start = this.worldPointB;
      end = start.subO(edgeB);
    }

    return { shape, index, start, end };
  }

  getNextShapeEdge(): Edge {
    const { iterA, iterB } = this;
    let edgeA = iterA.edgeVector;
    let edgeB = iterB.edgeVector.negateO();

    let shape = this.shapeA;
    let index: number;
    let start: Vector;
    let end: Vector;
    let advancedA = false;

    if (edgeA.cross2D(edgeB) > 0) {
      iterA.next();
      advancedA = true;
      edgeA = iterA.edgeVector;
    } else {
      iterB.next();
      iterB.edgeVector.negateO(edgeB);
    }

    if (edgeA.cross2D(edgeB) > 0) {
      index = iterA.index;
      start = iterA.vertex;
      end = iterA.nextVertex;
    } else {
      shape = this.shapeB;
      index = iterB.index;
      start = iterB.vertex;
      end = iterB.nextVertex;
    }

    if (advancedA)
      iterA.prev();
    else
      iterB.prev();

    return { shape, index, start, end };
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
