import { GeometryIterator, Shape } from '.';
import { Vector } from '../../vectors';

export class ShapeIterator implements GeometryIterator {
  constructor(readonly shape: Shape, index: number, isWorld: boolean = false) {
    this._index = index;
    this.vertices = shape.vertexList.items;
    this.edgeVectors = shape.edgeVectorList.items;
    this.vertexCount = this.vertices.length;

    if (isWorld)
      this.isWorld = isWorld;
  }

  protected isWorld?: boolean;
  readonly vertexCount: number;
  protected readonly vertices: Vector[];
  protected readonly edgeVectors: Vector[];
  protected _index: number;
  get index() { return this._index; }
  set index(value) { this._index = value; }
  get vertex() {
    return this.isWorld
      ? this.shape.toWorld(this.vertices[this._index])
      : this.vertices[this._index];
  }
  get nextVertex() {
    const index = (this._index + 1) % this.vertexCount;

    return this.isWorld
      ? this.shape.toWorld(this.vertices[index])
      : this.vertices[index];
  }
  get prevVertex() {
    const index = this._index > 0 ? this._index - 1 : this.vertexCount - 1;

    return this.isWorld
      ? this.shape.toWorld(this.vertices[index])
      : this.vertices[index];
  }
  get edgeVector() {
    return this.isWorld
      ? this.shape.toWorld(this.edgeVectors[this._index])
      : this.edgeVectors[this._index];
  }
  get prevEdgeVector() {
    const index = this._index > 0 ? this._index - 1 : this.vertexCount - 1;

    return this.isWorld
      ? this.shape.toWorld(this.edgeVectors[index])
      : this.edgeVectors[index];
  }
  get normalDirection() {
    return this.isWorld
      ? this.shape.toWorld(this.shape.normalList.items[this._index])
      : this.shape.normalList.items[this._index];
  }
  get normal() { return this.normalDirection; }

  next() { this._index = (this._index + 1) % this.vertexCount; }
  prev() { this._index = this._index > 0 ? this._index - 1 : this.vertexCount - 1; }
}
