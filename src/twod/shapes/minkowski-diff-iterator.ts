import { MinkowskiPoint, Shape } from '.';
import { getCircleVertex, ICircle } from '..';
import { Vector } from '../../vectors';
import { getCircleEdge } from '../geometry';
import { CircleSegmentInfo, getCircleSegmentInfo } from '../utils';

type GetVectorFunc = (index: number) => Vector;

export type Edge = {
  shape: Shape;
  index: number;
  start: Vector;
  end: Vector;
}

export class MinkowskiVertexIterator extends MinkowskiPoint {
  constructor(start: MinkowskiPoint, circleSegments?: CircleSegmentInfo) {
    super(
      start.shapeA,
      start.shapeB,
      start.point.clone(),
      start.indexA,
      start.indexB,
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

  getEdgeA(): Edge {
    let index = this.indexA;
    const edge = this.getWorldEdgeA(index);

    let start = this.worldPointA;
    let end = start.addO(edge);
    return { shape: this.shapeA, index, start, end };
  }

  getEdgeB(): Edge {
    let index = this.indexB;
    const edge = this.getWorldEdgeB(index);

    let start = this.worldPointB;
    let end = start.addO(edge);
    return { shape: this.shapeB, index, start, end };
  }

  getNextEdgeA(): Edge {
    let index = this.indexA;
    const currEdge = this.getWorldEdgeA(index);
    index = (index + 1) % this.vertexCountA;
    const edge = this.getWorldEdgeA(index);

    let curr = this.worldPointA;
    let start = curr.addO(currEdge);
    let end = start.addO(edge);
    return { shape: this.shapeA, index, start, end };
  }

  getNextEdgeB(): Edge {
    let index = this.indexB;
    const currEdge = this.getWorldEdgeB(index);
    index = (index + 1) % this.vertexCountB;
    const edge = this.getWorldEdgeB(index);

    let curr = this.worldPointB;
    let start = curr.addO(currEdge);
    let end = start.addO(edge);
    return { shape: this.shapeB, index, start, end };
  }

  getPrevEdgeA(): Edge {
    let index = this.indexA;
    index = index > 0 ? index - 1 : this.vertexCountA - 1;
    const edge = this.getWorldEdgeA(index);

    let end = this.worldPointA;
    let start = end.subO(edge);
    return { shape: this.shapeA, index, start, end };
  }

  getPrevEdgeB(): Edge {
    let index = this.indexB;
    index = index > 0 ? index - 1 : this.vertexCountB - 1;
    const edge = this.getWorldEdgeB(index);

    let end = this.worldPointB;
    let start = end.subO(edge);
    return { shape: this.shapeB, index, start, end };
  }

  getPrevPrevEdgeA(): Edge {
    let index = this.indexA;
    index = index > 0 ? index - 1 : this.vertexCountA - 1;
    const prevEdge = this.getWorldEdgeA(index);
    index = index > 0 ? index - 1 : this.vertexCountA - 1;
    const edge = this.getWorldEdgeA(index);

    let curr = this.worldPointA;
    let end = curr.subO(prevEdge);
    let start = end.subO(edge);
    return { shape: this.shapeA, index, start, end };
  }

  getPrevPrevEdgeB(): Edge {
    let index = this.indexB;
    index = index > 0 ? index - 1 : this.vertexCountB - 1;
    const prevEdge = this.getWorldEdgeB(index);
    index = index > 0 ? index - 1 : this.vertexCountB - 1;
    const edge = this.getWorldEdgeB(index);

    let curr = this.worldPointB;
    let end = curr.subO(prevEdge);
    let start = end.subO(edge);
    return { shape: this.shapeB, index, start, end };
  }

  getCurrentShapeEdge(): Edge {
    let { indexA, indexB } = this;
    const edgeA = this.getWorldEdgeA(indexA);
    const edgeB = this.getWorldEdgeB(indexB).negateO();

    let shape = this.shapeA;
    let index: number;
    let start: Vector;
    let end: Vector;

    if (edgeA.cross2D(edgeB) > 0) {
      index = indexA;
      start = this.worldPointA;
      end = start.addO(edgeA);
    } else {
      shape = this.shapeB;
      index = indexB;
      start = this.worldPointB;
      end = start.subO(edgeB);
    }

    return { shape, index, start, end };
  }

  getNextShapeEdge(): Edge {
    let { indexA, indexB } = this;
    let edgeA = this.getWorldEdgeA(indexA);
    let edgeB = this.getWorldEdgeB(indexB).negateO();

    let shape = this.shapeA;
    let index: number;
    let start: Vector;
    let end: Vector;

    if (edgeA.cross2D(edgeB) > 0) {
      indexA = (indexA + 1) % this.vertexCountA;
      edgeA = this.getWorldEdgeA(indexA);
    } else {
      indexB = (indexB + 1) % this.vertexCountB;
      edgeB = this.getWorldEdgeB(indexB).negateO();
    }

    if (edgeA.cross2D(edgeB) > 0) {
      shape = this.shapeA;
      index = indexA;
      start = this.getWorldVertexA(index);
      end = start.addO(edgeA);
    } else {
      shape = this.shapeB;
      index = indexB;
      start = this.getWorldVertexB(index);
      end = start.subO(edgeB);
    }

    return { shape, index, start, end };
  }

  getPrevShapeEdge(): Edge {
    let { indexA, indexB } = this;
    let prevA = indexA > 0 ? indexA - 1 : this.vertexCountA - 1;
    let prevB = indexB > 0 ? indexB - 1 : this.vertexCountB - 1;
    let prevEdgeA = this.getWorldEdgeA(prevA);
    let prevEdgeB = this.getWorldEdgeB(prevB).negateO();

    let shape: Shape;
    let index: number;
    let start: Vector;
    let end: Vector;

    if (prevEdgeA.cross2D(prevEdgeB) < 0) {
      indexA = prevA;
      prevA = indexA > 0 ? indexA - 1 : this.vertexCountA - 1;
      prevEdgeA = this.getWorldEdgeA(prevA);
    } else {
      indexB = prevB;
      prevB = indexB > 0 ? indexB - 1 : this.vertexCountB - 1;
      prevEdgeB = this.getWorldEdgeB(prevB).negateO();
    }

    if (prevEdgeA.cross2D(prevEdgeB) < 0) {
      shape = this.shapeA;
      index = prevA;
      start = this.getWorldVertexA(index);
      end = start.addO(prevEdgeA);
    } else {
      shape = this.shapeB;
      index = prevB;
      start = this.getWorldVertexB(index);
      end = start.subO(prevEdgeB);
    }

    return { shape, index, start, end };
  }

  next() {
    let { indexA, indexB } = this;
    const edgeA = this.getWorldEdgeA(indexA);
    const edgeB = this.getWorldEdgeB(indexB).negateO();

    let edge: Vector;

    if (edgeA.cross2D(edgeB) > 0) {
      edge = edgeA;
      indexA = (indexA + 1) % this.vertexCountA;
    } else {
      edge = edgeB;
      indexB = (indexB + 1) % this.vertexCountB;
    }

    this.worldPoint = this.worldPoint.addO(edge);
    this._worldPointA = undefined;
    this._worldPointB = undefined;
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
    const prevEdgeB = this.getWorldEdgeB(prevB).negateO();

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
    this._worldPointA = undefined;
    this._worldPointB = undefined;
    this.indexA = indexA;
    this.indexB = indexB;
    return this;
  }

  protected getCircleWorldVertexA(index: number) {
    return this.shapeA.toWorld(getCircleVertex(this.shapeA as ICircle, index, this.circleSegments));
  }
  protected getCircleWorldVertexB(index: number) {
    const vertex = getCircleVertex(this.shapeB as ICircle, index, this.circleSegments);
    return this.shapeB.toWorld(vertex);
  }

  protected getCircleWorldEdgeA(index: number) {
    return this.shapeA.toWorld(getCircleEdge(this.shapeA as ICircle, index, this.circleSegments));
  }

  protected getCircleWorldEdgeB(index: number) {
    const edge = getCircleEdge(this.shapeB as ICircle, index, this.circleSegments);
    return this.shapeB.toWorld(edge);
  }

  protected getPolyWorldVertexA(index: number) {
    return this.shapeA.toWorld(this.shapeA.vertexList.items[index]);
  }

  protected getPolyWorldVertexB(index: number) {
    return this.shapeB.toWorld(this.shapeB.vertexList.items[index]);
  }

  protected getPolyWorldEdgeA(index: number) {
    return this.shapeA.toWorld(this.shapeA.edgeVectorList.items[index]);
  }

  protected getPolyWorldEdgeB(index: number) {
    return this.shapeB.toWorld(this.shapeB.edgeVectorList.items[index]);
  }
}
