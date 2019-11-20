import { IShape, Projection, Shape, ShapeAxis, shapeContainsPoint, SupportPoint } from '.';
import { calcIntersectPoint, closestPoint, ContextProps, Geometry, Integrator, Viewport } from '..';
import { MathEx, Tristate } from '../../core';
import { Matrix2D, MatrixValues } from '../../matrix';
import { Vector, Vector2D, VectorClass, VectorGroups } from '../../vectors';

export const EMPTY_AXES: Vector[] = [];
export const EMPTY_SUPPORT_AXES: ShapeAxis[] = [];
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

  getSupport(axis: ShapeAxis, result?: SupportPoint): Tristate<SupportPoint> {
    const vertices = this.vertexList.items;
    const vertexCount = this.vertexList.length;

    if (vertexCount === 0) return undefined;

    const axisPoint = axis.point;
    const axisDirection = axis.normal;
    const vertexToPoint = Vector.create();
    const hasAxisPoint = !axisPoint.isEmpty;
    let bestVertex = vertices[0];
    let bestDistance = -Infinity;
    let bestIndex = -1;

    if (hasAxisPoint) {
      for (let i = 0; i < vertexCount; i++) {
        const vertex = vertices[i];
        axisPoint.subO(vertex, vertexToPoint);
        const distance = vertexToPoint.dot(axisDirection);

        if (distance > bestDistance) {
          bestVertex = vertex;
          bestIndex = i;
          bestDistance = distance;
        }
      }
    } else {
      for (let i = 0; i < vertexCount; i++) {
        const vertex = vertices[i];
        const distance = vertex.dot(axisDirection);

        if (distance > bestDistance) {
          bestVertex = vertex;
          bestIndex = i;
          bestDistance = distance;
        }
      }
    }

    // @ts-ignore - "this" not assignable to Shape.
    result || (result = new SupportPoint(this));

    // Force typescript to realize result is assigned.
    if (!result) return undefined;

    result.clear();
    // @ts-ignore - "this" not assignable to Shape.
    result.shape = this;
    result.point = bestVertex;
    result.index = bestIndex;
    result.distance = bestDistance;
    return result;
  }

  getAxes(result?: ShapeAxis[]) {
    result || (result = []);
    const vertices = this.vertexList.items;
    const normals = this.normalList.items;
    const count = normals.length;

    for (let i = 0; i < count; i++) {
      const vertex = vertices[i];
      const normal = normals[i];
      // @ts-ignore - "this" not assignable to ITriangleShape.
      result.push(new ShapeAxis(this, normal, vertex));
    }

    return result;
  }

  // @ts-ignore - unused param.
  getDynamicAxes(other: Shape, result?: ShapeAxis[]) { return result || EMPTY_SUPPORT_AXES; }

  createAxis(normal: Vector, result?: ShapeAxis): ShapeAxis {
    // @ts-ignore - "this" not assignable to ITriangleShape.
    result || (result = new ShapeAxis(this));
    // Appease typescript.
    if (!result) throw new Error("impossible");

    result.clear();
    result.normal = normal;
    return result!;
  }

  createWorldAxis(worldNormal: Vector, result?: ShapeAxis): ShapeAxis {
    // @ts-ignore - "this" not assignable to ITriangleShape.
    result || (result = new ShapeAxis(this));
    // Appease typescript.
    if (!result) throw new Error("impossible");

    result.clear();
    result.worldNormal = worldNormal;
    return result!;
  }

  projectOn(worldAxis: Vector, result?: Projection): Tristate<Projection> {
    const vertices = this.vertexList.items;
    const vertexCount = this.vertexList.length;

    if (vertexCount === 0) return undefined;

    const worldVertex = Vector.create();
    let min = Infinity;
    let max = -Infinity;
    let minPoint = Vector.create();
    let maxPoint = Vector.create();

    for (let i = 0; i < vertexCount; i++) {
      const vertex = vertices[i];
      const dot = worldAxis.dot(this.toWorld(vertex, worldVertex));

      if (dot < min) {
        min = dot;
        minPoint.copyFrom(worldVertex);
      }

      if (dot > max) {
        max = dot;
        maxPoint.copyFrom(worldVertex);
      }
    }

    result || (result = new Projection());
    result.min = min;
    result.max = max;
    result.minPoint = minPoint;
    result.maxPoint = maxPoint;
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
}
