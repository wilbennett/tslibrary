import { Edge, Shape } from '.';
import { Vector } from '../../vectors';

export class EdgeImpl implements Edge {
  constructor(
    public shape: Shape,
    public index: number,
    start?: Vector,
    end?: Vector,
    worldStart?: Vector,
    worldEnd?: Vector,
    normal?: Vector,
    worldNormal?: Vector,
    normalDirection?: Vector,
    worldNormalDirection?: Vector) {
    if (start) this._start = start;
    if (end) this._end = end;
    if (worldStart) this._worldStart = worldStart;
    if (worldEnd) this._worldEnd = worldEnd;
    if (normalDirection) this._normalDirection = normalDirection;
    if (worldNormalDirection) this._worldNormalDirection = worldNormalDirection;
    if (normal) this._normal = normal;
    if (worldNormal) this._worldNormal = worldNormal;
  }

  protected _start?: Vector;
  get start() {
    if (!this._start) {
      const vertices = this.shape.vertexList.items;

      if (vertices.length > 0)
        this._start = vertices[this.index];
      else if (this._worldStart && !this._worldStart.isEmpty)
        this._start = this.shape.toLocal(this._worldStart);
      else
        this._start = Vector.empty;
    }

    return this._start;
  }
  set start(value) { this._start = value; }
  protected _worldStart?: Vector;
  get worldStart() {
    if (!this._worldStart) {
      const start = this.start;
      this._worldStart = start && !start.isEmpty ? this.shape.toWorld(start) : Vector.empty;
    }

    return this._worldStart;
  }
  set worldStart(value) { this._worldStart = value; }

  protected _end?: Vector;
  get end() {
    if (!this._end) {
      const vertices = this.shape.vertexList.items;

      if (vertices.length > 0)
        this._end = vertices[(this.index + 1) % vertices.length];
      else if (this._worldEnd && !this._worldEnd.isEmpty)
        this._end = this.shape.toLocal(this._worldEnd);
      else
        this._end = Vector.empty;
    }

    return this._end;
  }
  set end(value) { this._end = value; }
  protected _worldEnd?: Vector;
  get worldEnd() {
    if (!this._worldEnd) {
      const end = this.end;
      this._worldEnd = end && !end.isEmpty ? this.shape.toWorld(end) : Vector.empty;
    }

    return this._worldEnd;
  }
  set worldEnd(value) { this._worldEnd = value; }

  protected _normalDirection?: Vector;
  get normalDirection() {
    if (!this._normalDirection) {
      const normals = this.shape.normalList.items;

      if (normals.length > 0)
        this._normalDirection = normals[this.index];
      else if (this._normal && !this._normal.isEmpty)
        this._normalDirection = this._normal;
      else if (this._worldNormalDirection && !this._worldNormalDirection.isEmpty)
        this._normalDirection = this.shape.toLocal(this._worldNormalDirection);
      else
        this._normalDirection = Vector.empty;
    }

    return this._normalDirection;
  }
  set normalDirection(value) { this._normalDirection = value; }
  protected _worldNormalDirection?: Vector;
  get worldNormalDirection() {
    if (!this._worldNormalDirection) {
      const normalDirection = this.normalDirection;

      this._worldNormalDirection = normalDirection && !normalDirection.isEmpty
        ? this.shape.toWorld(normalDirection)
        : Vector.empty;
    }

    return this._worldNormalDirection;
  }
  set worldNormalDirection(value) { this._worldNormalDirection = value; }

  protected _normal?: Vector;
  get normal() {
    if (!this._normal) {
      const normals = this.shape.normalList.items;

      if (normals.length > 0)
        this._normal = normals[this.index];
      else if (this._normalDirection && !this._normalDirection.isEmpty)
        this._normal = this._normalDirection.normalizeO();
      else if (this._worldNormal && !this._worldNormal.isEmpty)
        this._normal = this.shape.toLocal(this._worldNormal);
      else
        this._normal = Vector.empty;
    }

    return this._normal;
  }
  set normal(value) { this._normal = value; }
  protected _worldNormal?: Vector;
  get worldNormal() {
    if (!this._worldNormal) {
      const normal = this.normal;

      this._worldNormal = normal && !normal.isEmpty
        ? this.shape.toWorld(normal)
        : Vector.empty;
    }

    return this._worldNormal;
  }
  set worldNormal(value) { this._worldNormal = value; }

  clear() {
    this.index = NaN;
    this._start && (this._start = undefined);
    this._worldStart && (this._worldStart = undefined);
    this._end && (this._end = undefined);
    this._worldEnd && (this._worldEnd = undefined);
    this._normalDirection && (this._normalDirection = undefined);
    this._worldNormalDirection && (this._worldNormalDirection = undefined);
    this._normal && (this._normal = undefined);
    this._worldNormal && (this._worldNormal = undefined);
  }

  clone(result?: Edge): Edge {
    result || (result = new EdgeImpl(this.shape, this.index));
    result.clear();
    result.shape = this.shape;
    result.index = this.index;
    this._start && (result.start = this._start.clone());
    this._worldStart && (result.worldStart = this._worldStart.clone());
    this._end && (result.end = this._end.clone());
    this._worldEnd && (result.worldEnd = this._worldEnd.clone());
    this._normalDirection && (result.normalDirection = this._normalDirection.clone());
    this._worldNormalDirection && (result.worldNormalDirection = this._worldNormalDirection.clone());
    this._normal && (result.normal = this._normal.clone());
    this._worldNormal && (result.worldNormal = this._worldNormal.clone());
    return result;
  }
}
