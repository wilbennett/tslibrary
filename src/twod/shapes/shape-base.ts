import { IShape, Shape, SupportInfo } from '.';
import { calcIntersectPoint, containsPoint, ContextProps, Geometry, Integrator, Viewport } from '..';
import { MathEx, Tristate } from '../../core';
import { Vector, VectorGroups } from '../../vectors';

export abstract class ShapeBase implements IShape {
  protected _isWorld?: boolean = false;
  get isWorld() { return !!this._isWorld; }
  get integrators(): Integrator[] { return []; }
  get position() { return Vector.empty; }
  // @ts-ignore - unused param.
  set position(value) { }
  get angle() {
    const integrators = this.integrators;
    return integrators.length > 0 ? integrators[0].angle : 0;
  }
  set angle(value) { this.setAngle(value); }
  protected _data?: VectorGroups;
  get data(): VectorGroups { return this._data || (this._data = new VectorGroups()); }
  get vertices() { return this.data.get("vertex"); }
  get edgeVectors() { return this.data.get("edge"); }
  get normals() { return this.data.get("normal"); }
  boundingShape?: Shape;
  protected _props?: ContextProps;
  get props(): ContextProps { return this._props || { strokeStyle: "black", fillStyle: "black", lineDash: [] }; }
  set props(value) { this._props = value; }

  setPosition(position: Vector) {
    this.position.copyFrom(position);
  }

  setAngle(radians: number) {
    this.integrators.forEach(integrator => integrator.angle = radians);
  }

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

  containsPoint(point: Vector, epsilon: number = MathEx.epsilon) {
    // @ts-ignore - assigment compatibility.
    return containsPoint(this, point, epsilon);
  }

  getIntersectPoint(other: Geometry, result?: Vector): Tristate<Vector> {
    // @ts-ignore - assigment compatibility.
    return calcIntersectPoint(this, other, result);
  }

  // @ts-ignore - unused param.
  protected renderCore(viewport: Viewport, props: ContextProps) { }

  render(viewport: Viewport) {
    const ctx = viewport.ctx;
    const props = this.props;
    let lineWidth = viewport.calcLineWidth(props.lineWidth !== undefined ? props.lineWidth : 1);

    ctx.withProps(props).withLineWidth(lineWidth);

    this.renderCore(viewport, props);
  }
}
