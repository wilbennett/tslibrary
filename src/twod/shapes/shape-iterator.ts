import { Edge, EdgeImpl, GeometryIterator, Shape, SupportPoint } from '.';
import { Vector } from '../../vectors';

export class ShapeIterator implements GeometryIterator {
  constructor(readonly shape: Shape, index: number, isWorld: boolean = false) {
    this._index = index;
    this._vertices = shape.vertexList.items;
    this._edgeVectors = shape.edgeVectorList.items;

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
  get edge(): Edge { return new EdgeImpl(this.shape, this.index); }
  get prevEdge(): Edge { return new EdgeImpl(this.shape, this._index > 0 ? this._index - 1 : this.vertexCount - 1); }
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
  get normalDirection() {
    return this.isWorld
      ? this.shape.toWorld(this.shape.normalList.items[this._index])
      : this.shape.normalList.items[this._index];
  }
  get normal() { return this.normalDirection; }

  next() { this._index = (this._index + 1) % this.vertexCount; }
  prev() { this._index = this._index > 0 ? this._index - 1 : this.vertexCount - 1; }

  getSupport(direction: Vector, result?: SupportPoint): SupportPoint {
    return this.shape.getSupport(direction, result);
  }
}
