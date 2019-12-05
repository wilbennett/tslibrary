import { Edge, EdgeImpl, GeometryIterator, IPlaneShape, Shape } from '.';
import { pos, Vector } from '../../vectors';

const REF_POSITION = pos(1, 1);

export class PlaneIterator implements GeometryIterator {
  constructor(readonly shape: IPlaneShape, refShape: Shape, index: number, isWorld: boolean = false) {
    if (refShape.usesReferenceShape)
      throw new Error(`Cannot itterate a plane using a ${refShape.kind}`);

    this._refShape = refShape;
    this._index = index;

    this._refShapeRefVector = pos(NaN, NaN);

    this._vertices = [];
    this._edgeVectors = [];

    if (isWorld)
      this.isWorld = isWorld;

    this.checkReferenceShapePosition();
  }

  protected _refShape: Shape;
  protected _refShapeRefVector: Vector;
  protected isWorld?: boolean;
  get vertexCount() { return 2; }
  protected readonly _vertices: Vector[];
  get vertices() {
    this.checkReferenceShapePosition();
    return this._vertices;
  }
  protected _index: number;
  get index() { return this._index; }
  set index(value) {
    this._index = value;
    this.checkReferenceShapePosition(true);
  }
  get vertex() {
    this.checkReferenceShapePosition();

    return this.isWorld
      ? this.shape.toWorld(this._vertices[this._index])
      : this._vertices[this._index];
  }
  get nextVertex() {
    this.checkReferenceShapePosition();

    return this.isWorld
      ? this.shape.toWorld(this._vertices[1 - this.index])
      : this._vertices[1 - this.index];
  }
  get prevVertex() {
    this.checkReferenceShapePosition();

    return this.isWorld
      ? this.shape.toWorld(this._vertices[1 - this.index])
      : this._vertices[1 - this.index];
  }
  protected readonly _edgeVectors: Vector[];
  get edgeVectors() {
    this.checkReferenceShapePosition();
    return this._edgeVectors;
  }
  protected _edge?: Edge;
  get edge(): Edge {
    this.checkReferenceShapePosition();

    if (!this._edge) {
      if (this.isWorld) {
        this._edge = new EdgeImpl(
          this.shape,
          this.index,
          undefined,
          undefined,
          this.vertex.clone(),
          this.nextVertex,
          undefined,
          undefined,
          undefined,
          this.normalDirection);
      } else {
        this._edge = new EdgeImpl(
          this.shape,
          this.index,
          this.vertex.clone(),
          this.nextVertex,
          undefined,
          undefined,
          undefined,
          undefined,
          this.normalDirection,
          undefined);
      }
    }

    return this._edge;
  }
  get prevEdge(): Edge {
    this.checkReferenceShapePosition();

    const vertex = this.vertex.clone();
    const prevVertex = this.prevVertex;
    const normalDirection = vertex.subO(prevVertex).perpRight();
    const index = 1 - this._index;

    if (this.isWorld) {
      return new EdgeImpl(
        this.shape,
        index,
        undefined,
        undefined,
        prevVertex,
        vertex,
        undefined,
        undefined,
        undefined,
        normalDirection);
    }

    return new EdgeImpl(
      this.shape,
      index,
      prevVertex,
      vertex,
      undefined,
      undefined,
      undefined,
      undefined,
      normalDirection,
      undefined);
  }
  protected _edgeVector?: Vector;
  get edgeVector() {
    this.checkReferenceShapePosition();

    return this.isWorld
      ? this.shape.toWorld(this._edgeVectors[this._index])
      : this._edgeVectors[this._index];
  }
  get prevEdgeVector() {
    this.checkReferenceShapePosition();
    const index = 1 - this._index;

    return this.isWorld
      ? this.shape.toWorld(this._edgeVectors[index])
      : this._edgeVectors[index];
  }
  get normalDirection() {
    if (this._index === 0)
      return this.isWorld ? this.shape.toWorld(this.shape.normal.negateO()) : this.shape.normal.negateO();

    return this.isWorld ? this.shape.toWorld(this.shape.normal) : this.shape.normal;

  }
  get normal() { return this.normalDirection; }

  next() {
    this._index = 1 - this._index;
    this.checkReferenceShapePosition(true);
  }

  prev() {
    this._index = 1 - this._index;
    this.checkReferenceShapePosition(true);
  }

  checkReferenceShapePosition(force: boolean = false) {
    const plane = this.shape;
    const refShape = this._refShape;

    if (!force) { // Check if reference shape has changed position/orientation.
      const ref = refShape.toWorld(REF_POSITION);

      if (ref.equals(this._refShapeRefVector)) return;

      this._refShapeRefVector.copyFrom(ref);
    }

    this._vertices.splice(0);
    this._edgeVectors.splice(0);
    this._edge = undefined;
    this._edgeVector = undefined;

    const dir = plane.normal.perpLeftO();
    const refDir = plane.toLocalOf(refShape, dir);
    const minSupport = refShape.getSupport(refDir);
    const maxSupport = refShape.getSupport(refDir.negateO());

    const minClosest = plane.toLocal(plane.closestPoint(minSupport.worldPoint)!);
    const maxClosest = plane.toLocal(plane.closestPoint(maxSupport.worldPoint)!);

    minClosest.displaceByScaled(dir, 1.5);
    maxClosest.displaceByNegScaled(dir, 1.5);

    this._vertices.push(minClosest, maxClosest);
    this._edgeVectors.push(maxClosest.subO(minClosest), minClosest.subO(maxClosest));
  }
}
