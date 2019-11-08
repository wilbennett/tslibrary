import { IShape, Shape, SupportInfo } from '.';
import { calcIntersectPoint, ContextProps, Geometry, Viewport } from '..';
import { Tristate } from '../../core';
import { Vector, VectorGroups } from '../../vectors';

export abstract class ShapeBase implements IShape {
  protected _isWorld?: boolean = false;
  get isWorld() { return !!this._isWorld; }
  get position() { return Vector.empty; }
  // @ts-ignore - unused param.
  set position(value) { }
  get angle() { return 0; }
  protected _data?: VectorGroups;
  get data(): VectorGroups { return this._data || (this._data = new VectorGroups()); }
  get vertices() { return this.data.get("vertex"); }
  get edgeVectors() { return this.data.get("edge"); }
  get normals() { return this.data.get("normal"); }
  boundingShape?: Shape;
  protected _props?: ContextProps;
  get props(): ContextProps { return this._props || { strokeStyle: "black", fillStyle: "black" }; }
  set props(value) { this._props = value; }

  // @ts-ignore - unused param.
  setPosition(position: Vector) { }
  // @ts-ignore - unused param.
  setAngle(radians: number) { }
  // @ts-ignore - unused param.
  containsPoint(point: Vector) { return false; }

  getSupport(direction: Vector, result?: SupportInfo): SupportInfo;
  getSupport(radians: number, result?: SupportInfo): SupportInfo;
  // @ts-ignore - unused param.
  getSupport(direction: Vector | number, result?: SupportInfo) {
    result = result || [Vector.create(0, 0), -1];
    result[0].copyFrom(Vector.empty);
    result[1] = -1;
    return result;
  }

  // @ts-ignore - unused param.
  getAxes(other: Shape, result?: Vector[]): Vector[] { return []; }

  toWorld(point: Vector, result?: Vector) {
    result = result || Vector.create(0, 0);
    return result.copyFrom(point);
  }

  toLocal(point: Vector, result?: Vector) {
    result = result || Vector.create(0, 0);
    return result.copyFrom(point);
  }

  toLocalOf(other: Shape, point: Vector, result?: Vector) {
    return this.toLocal(other.toWorld(point, result), result);
  }

  // abstract createWorldShape(): this;

  getIntersectPoint(other: Geometry, result?: Vector): Tristate<Vector> {
    // @ts-ignore - assigment compatibility.
    return calcIntersectPoint(this, other, result);
  }

  // @ts-ignore - unused param.
  protected renderCore(viewport: Viewport) { }

  render(viewport: Viewport) {
    const ctx = viewport.ctx;
    const props = this.props;
    let lineWidth = viewport.calcLineWidth(props.lineWidth !== undefined ? props.lineWidth : 1);

    ctx.withProps(props).withLineWidth(lineWidth);

    this.renderCore(viewport);
  }
}
