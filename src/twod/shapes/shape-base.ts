import { IShape, Shape, shapeContainsPoint } from '.';
import { calcIntersectPoint, closestPoint, ContextProps, Geometry, Integrator, Viewport } from '..';
import { MathEx, Tristate } from '../../core';
import { Matrix2D, MatrixValues } from '../../matrix';
import { Vector, Vector2D, VectorClass, VectorGroups } from '../../vectors';
import { Projection } from '../collision';

const EMPTY_AXES: Vector[] = [];
export const ORIGIN = Vector.createPosition(0, 0);

export abstract class ShapeBase implements IShape {
  constructor() {
    const matrix = this.matrix;
    this._transform = matrix.createValues();
    this._transformInverse = matrix.createValues();
  }

  static vectorClass: VectorClass = Vector2D;
  protected get matrix() { return Matrix2D.instance; /* TODO: Make dimension agnostic. */ }
  protected _isWorld?: boolean = false;
  get isWorld() { return !!this._isWorld; }
  get integrators(): Integrator[] { return []; }
  get position() { return Vector.empty; }
  // @ts-ignore - unused param.
  set position(value) { }
  get center() { return ORIGIN; }
  get angle() {
    const integrators = this.integrators;
    return integrators.length > 0 ? integrators[0].angle : 0;
  }
  set angle(value) { this.setAngle(value); }
  protected _data?: VectorGroups;
  get data(): VectorGroups { return this._data || (this._data = new VectorGroups()); }
  get vertexList() { return this.data.get("vertex"); }
  get edgeVectorList() { return this.data.get("edge"); }
  get normalList() { return this.data.get("normal"); }
  get hasDynamicAxes() { return false; }
  boundingShape?: Shape;
  protected _isTransformDirty = true;
  protected _transform: MatrixValues;
  get transform() {
    if (this._isTransformDirty) {
      this.calcTransform(this._transform, this._transformInverse);
      this.cleanTransform();
    }

    return this._transform;
  }
  protected _transformInverse: MatrixValues;
  get transformInverse() {
    if (this._isTransformDirty) {
      this.calcTransform(this._transform, this._transformInverse);
      this.cleanTransform();
    }

    return this._transformInverse;
  }
  protected _props?: ContextProps;
  get props(): ContextProps { return this._props || { strokeStyle: "black", fillStyle: "black", lineDash: [] }; }
  set props(value) { this._props = value; }

  setPosition(position: Vector) {
    this.position.copyFrom(position);
    this.dirtyTransform();
  }

  protected setAngle(radians: number) {
    this.integrators.forEach(integrator => integrator.angle = radians);
    this.dirtyTransform();
  }

  getSupport(direction: Vector, result?: Vector): Tristate<number | Vector> {
    return this.getSupportFromVector(direction, result);
  }

  getSupportPoint(direction: Vector, result?: Vector): Tristate<Vector> {
    const info = this.getSupportFromVector(direction, result);

    if (info === null || info === undefined) return info;

    return info instanceof Vector ? info : this.vertexList.items[info].clone(result);
  }

  getAxes(result?: Vector[]): Vector[] {
    result || (result = []);
    const normals = this.normalList.items;
    normals.forEach(n => result!.push(n));
    return result;
  }

  // @ts-ignore - unused param.
  getDynamicAxes(other: Shape, result?: Vector[]): Vector[] { return result || EMPTY_AXES; }

  projectOn(worldAxis: Vector, result?: Projection): Tristate<Projection> {
    const axis = this.toLocal(worldAxis);
    const support1 = this.getSupportPoint(axis);
    const support2 = this.getSupportPoint(axis.negateO());

    if (!support1 || !support2) return undefined;

    this.toWorld(support1, support1);
    this.toWorld(support2, support2);

    const value1 = support1.dot(worldAxis);
    const value2 = support2.dot(worldAxis);

    result || (result = new Projection());

    if (value1 < value2) {
      result.min = value1;
      result.max = value2;
      result.minPoint = support1;
      result.maxPoint = support2;
    } else {
      result.min = value2;
      result.max = value1;
      result.minPoint = support2;
      result.maxPoint = support1;
    }

    return result;
  }

  toWorld(localPoint: Vector, result?: Vector) {
    if (this.isWorld) {
      result = result || Vector.create(0, 0);
      return result.copyFrom(localPoint);
    }

    return this.matrix.transform(localPoint, this.transform, result);
  }

  toLocal(worldPoint: Vector, result?: Vector) {
    if (this.isWorld) {
      result = result || Vector.create(0, 0);
      return result.copyFrom(worldPoint);
    }

    return this.matrix.transform(worldPoint, this.transformInverse, result);
  }

  toLocalOf(other: Shape, localPoint: Vector, result?: Vector) {
    return this.toLocal(other.toWorld(localPoint, result), result);
  }

  // abstract createWorldShape(): this;

  containsPoint(point: Vector, epsilon: number = MathEx.epsilon) {
    // @ts-ignore - assigment compatibility.
    return shapeContainsPoint(this, point, epsilon);
  }

  closestPoint(point: Vector, hullOnly: boolean = false, result?: Vector) {
    // @ts-ignore - assigment compatibility.
    return closestPoint(this, point, hullOnly, result);
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

    ctx
      .pushThenUpdate(this.transform)
      .withProps(props)
      .withLineWidth(lineWidth);

    this.renderCore(viewport, props);
    ctx.popTransform();
  }

  protected dirtyTransform() { this._isTransformDirty = true; }
  protected cleanTransform() { this._isTransformDirty = false; }

  protected calcTransform(transform: MatrixValues, transformInverse: MatrixValues) {
    const matrix = this.matrix;

    matrix
      .setToIdentity()
      .setRotation2D(this.angle)
      .setTranslation(this.position);

    matrix.getValues(transform);
    matrix.getInverse(transformInverse);
  }

  // @ts-ignore - unused param.
  protected getSupportFromVector(direction: Vector, result?: Vector): Tristate<number | Vector> {
    const vertices = this.vertexList.items;
    const vertexCount = this.vertexList.length;

    if (vertexCount === 0) return undefined;

    let best = -Infinity;
    let bestIndex = -1;

    for (let i = 0; i < vertexCount; i++) {
      const dot = vertices[i].dot(direction);

      if (dot > best) {
        best = dot;
        bestIndex = i;
      }
    }

    return bestIndex;
  }

  protected getSupportFromAngle(radians: number, result?: Vector): Tristate<number | Vector> {
    return this.getSupportFromVector(Vector2D.fromRadians(radians, 1, 0), result);
  }
}
