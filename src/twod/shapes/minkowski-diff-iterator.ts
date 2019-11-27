import { MinkowskiPoint } from '.';
import { getCircleVertex, ICircle } from '..';
import { Vector } from '../../vectors';
import { getCircleEdge } from '../geometry';
import { CircleSegmentInfo, getCircleSegmentInfo } from '../utils';

type GetVectorFunc = (index: number) => Vector;

export class MinkowskiVertexIterator extends MinkowskiPoint {
  constructor(start: MinkowskiPoint, circleSegments?: CircleSegmentInfo) {
    super(
      start.shapeA,
      start.shapeB,
      start.point.clone(),
      start.indexA,
      start.indexB,
      start.worldPointA.clone(),
      start.worldPointB.clone(),
      start.worldDirection.clone());
    this.circleSegments = circleSegments || getCircleSegmentInfo();

    const verticesA = this.shapeA.vertexList.items;
    const verticesB = this.shapeB.vertexList.items;
    const { segmentCount } = this.circleSegments;

    if (this.shapeA.kind === "circle") {
      this.vertexCountA = segmentCount;
      this.getWorldVertexA = this.getCircleWorldVertexA;
      this.getWorldEdgeA = this.getCircleWorldEdgeA;
    } else {
      this.vertexCountA = verticesA.length;
      this.getWorldVertexA = this.getPolyWorldVertexA;
      this.getWorldEdgeA = this.getPolyWorldEdgeA;
    }

    if (this.shapeB.kind === "circle") {
      this.vertexCountB = segmentCount;
      this.getWorldVertexB = this.getCircleWorldVertexB;
      this.getWorldEdgeB = this.getCircleWorldEdgeB;
    } else {
      this.vertexCountB = verticesB.length;
      this.getWorldVertexB = this.getPolyWorldVertexB;
      this.getWorldEdgeB = this.getPolyWorldEdgeB;
    }
  }

  readonly circleSegments: CircleSegmentInfo;
  readonly vertexCountA: number;
  readonly vertexCountB: number;
  protected getWorldVertexA: GetVectorFunc;
  protected getWorldEdgeA: GetVectorFunc;
  protected getWorldVertexB: GetVectorFunc;
  protected getWorldEdgeB: GetVectorFunc;

  next() {
    let { indexA, indexB } = this;
    const edgeA = this.getWorldEdgeA(indexA);
    const edgeB = this.getWorldEdgeB(indexB);

    let edge: Vector;

    if (edgeA.cross2D(edgeB) > 0) {
      edge = edgeA;
      indexA = (indexA + 1) % this.vertexCountA;
    } else {
      edge = edgeB;
      indexB = (indexB + 1) % this.vertexCountB;
    }

    this.worldPoint = this.worldPoint.addO(edge);
    this.worldPointA = this.getWorldVertexA(indexA);
    this.worldPointB = this.getWorldVertexB(indexB);
    this.indexA = indexA;
    this.indexB = indexB;
    return this;
  }

  prev() {
    let { indexA, indexB } = this;
    let currA = indexA;
    let currB = indexB;
    let prevA = indexA > 0 ? indexA - 1 : this.vertexCountA - 1;
    let prevB = indexB > 0 ? indexB - 1 : this.vertexCountB - 1;
    const prevEdgeA = this.getWorldEdgeA(prevA);
    const prevEdgeB = this.getWorldEdgeB(prevB);

    let edge: Vector;

    if (prevEdgeA.cross2D(prevEdgeB) < 0) {
      edge = prevEdgeA;
      indexA = prevA;
      indexB = currB;
    } else {
      edge = prevEdgeB;
      indexA = currA;
      indexB = prevB;
    }

    this.worldPoint = this.point.subO(edge);
    this.worldPointA = this.getWorldVertexA(indexA);
    this.worldPointB = this.getWorldVertexB(indexB);
    this.indexA = indexA;
    this.indexB = indexB;
    return this;
  }

  protected getCircleWorldVertexA(index: number) {
    return this.shapeA.toWorld(getCircleVertex(this.shapeA as ICircle, index, this.circleSegments));
  }
  protected getCircleWorldVertexB(index: number) {
    const vertex = getCircleVertex(this.shapeB as ICircle, index, this.circleSegments);
    return this.shapeB.toWorld(vertex.negate());
  }

  protected getCircleWorldEdgeA(index: number) {
    return this.shapeA.toWorld(getCircleEdge(this.shapeA as ICircle, index, this.circleSegments));
  }

  protected getCircleWorldEdgeB(index: number) {
    const edge = getCircleEdge(this.shapeB as ICircle, index, this.circleSegments);
    return this.shapeB.toWorld(edge.negate());
  }

  protected getPolyWorldVertexA(index: number) {
    return this.shapeA.toWorld(this.shapeA.vertexList.items[index]);
  }

  protected getPolyWorldVertexB(index: number) {
    return this.shapeB.toWorld(this.shapeB.vertexList.items[index].negateO());
  }

  protected getPolyWorldEdgeA(index: number) {
    return this.shapeA.toWorld(this.shapeA.edgeVectorList.items[index]);
  }

  protected getPolyWorldEdgeB(index: number) {
    return this.shapeB.toWorld(this.shapeB.edgeVectorList.items[index].negateO());
  }
}
