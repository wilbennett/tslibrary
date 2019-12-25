import { Edge, GeometryIterator, LocalEdge, Shape, SupportPoint, WorldEdge } from '.';
import { Vector } from '../../vectors';

export class ShapeIterator implements GeometryIterator {
  constructor(readonly shape: Shape, index: number, isWorld: boolean = false) {
    this._index = index;
    this._vertices = shape.vertexList.items;
    this._edgeVectors = shape.edgeVectorList.items;
    this._normals = shape.normalList.items;

    this.isWorld = isWorld;
  }

  readonly isWorld: boolean;
  get vertexCount() { return this.shape.vertexList.length; }
  protected _vertices: Vector[];
  get vertices(): Vector[] {
    return this.isWorld
      ? this._vertices.map(v => this.shape.toWorld(v))
      : this._vertices;
  }
  protected _index: number;
  get index() { return this._index; }
  set index(value) { this._index = value; }
  get vertex() {
    return this.isWorld
      ? this.shape.toWorld(this._vertices[this._index])
      : this._vertices[this._index];
  }
  get nextVertex() {
    const index = (this._index + 1) % this.vertexCount;

    return this.isWorld
      ? this.shape.toWorld(this._vertices[index])
      : this._vertices[index];
  }
  get prevVertex() {
    const index = this._index > 0 ? this._index - 1 : this.vertexCount - 1;

    return this.isWorld
      ? this.shape.toWorld(this._vertices[index])
      : this._vertices[index];
  }
  protected readonly _edgeVectors: Vector[];
  get edgeVectors(): Vector[] {
    return this.isWorld
      ? this._edgeVectors.map(e => this.shape.toWorld(e))
      : this._edgeVectors;
  }
  get edge(): Edge {
    return this.isWorld
      ? new WorldEdge(this.shape, this.index, this.vertex, this.nextVertex, this.normal)
      : new LocalEdge(this.shape, this.index, this.vertex, this.nextVertex, this.normal);
  }
  get prevEdge(): Edge {
    const index = this._index > 0 ? this._index - 1 : this.vertexCount - 1;

    return this.isWorld
      ? new WorldEdge(this.shape, index, this.prevVertex, this.vertex, this.prevNormal)
      : new LocalEdge(this.shape, index, this.prevVertex, this.vertex, this.prevNormal);
  }
  get edgeVector() {
    return this.isWorld
      ? this.shape.toWorld(this._edgeVectors[this._index])
      : this._edgeVectors[this._index];
  }
  get prevEdgeVector() {
    const index = this._index > 0 ? this._index - 1 : this.vertexCount - 1;

    return this.isWorld
      ? this.shape.toWorld(this._edgeVectors[index])
      : this._edgeVectors[index];
  }
  private _normals: Vector[];
  get normalDirection() {
    return this.isWorld
      ? this.shape.toWorld(this._normals[this._index])
      : this._normals[this._index];
  }
  get normal() {
    return this.isWorld
      ? this.shape.toWorld(this._normals[this._index])
      : this._normals[this._index];
  }
  get prevNormal() {
    const index = this._index > 0 ? this._index - 1 : this.vertexCount - 1;

    return this.isWorld
      ? this.shape.toWorld(this._normals[index])
      : this._normals[index];
  }

  next() { this._index = (this._index + 1) % this.vertexCount; }
  prev() { this._index = this._index > 0 ? this._index - 1 : this.vertexCount - 1; }

  getSupport(direction: Vector, result?: SupportPoint): SupportPoint {
    return this.shape.getSupport(direction, result);
  }
}
