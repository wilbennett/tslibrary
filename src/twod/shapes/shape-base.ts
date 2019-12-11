import {
  Edge,
  EdgeImpl,
  GeometryIterator,
  IShape,
  NullSupportPoint,
  Projection,
  Shape,
  ShapeAxis,
  shapeContainsPoint,
  ShapeIterator,
  SupportPoint,
  SupportPointImpl,
} from '.';
import {
  calcIntersectPoint,
  closestPoint,
  ContextProps,
  EulerSemiImplicit,
  Geometry,
  Integrator,
  IntegratorClass,
  Viewport,
} from '..';
import { DEFAULT_MATERIAL, MassInfo, Material, MathEx, Tristate } from '../../core';
import { Matrix2D, MatrixValues } from '../../matrix';
import { dir, Vector, Vector2D, VectorClass, VectorGroups } from '../../vectors';
import { CircleSegmentInfo } from '../utils';

export const EMPTY_AXES: Vector[] = [];
export const EMPTY_SUPPORT_AXES: ShapeAxis[] = [];
export const ORIGIN = Vector.position(0, 0);
export type InertiaCalc = (mass: number) => number;

export abstract class ShapeBase implements IShape {
  constructor(
    area: number,
    isWorld: boolean = false,
    material?: Material,
    massInfo?: MassInfo,
    integratorType?: IntegratorClass,
    calcInertia: InertiaCalc = m => m) {
    integratorType || (integratorType = EulerSemiImplicit);
    material || (material = DEFAULT_MATERIAL);

    this._area = area;
    this._calcInertia = calcInertia;
    this._integratorType = integratorType;
    this._integrator = new integratorType();
    this._integrator.material = material;

    if (massInfo)
      this._integrator.massInfo = massInfo;
    else
      this.updateMassInfo();

    if (isWorld)
      this._isWorld = isWorld;

    const matrix = this.matrix;
    this._transform = matrix.createValues();
    this._transformInverse = matrix.createValues();
  }

  static vectorClass: VectorClass = Vector2D;
  protected _supportLookup?: [Vector, SupportPoint][] | null;

  protected get matrix() { return Matrix2D.instance; /* TODO: Make dimension agnostic. */ }
  protected _calcInertia: InertiaCalc;
  protected _area: number;
  protected get area() { return this._area; }
  protected set area(value) { this._area = value; }
  protected _isWorld?: boolean = false;
  get isWorld() { return !!this._isWorld; }
  protected _integratorType: IntegratorClass;
  get integratorType() { return this._integratorType; }
  set integratorType(value) {
    this._integratorType = value;
    this.integrator = new value();
  }
  protected _integrator: Integrator;
  get integrator() { return this._integrator; }
  set integrator(value) {
    this._integrator.assignTo(value);
    this._integrator = value;
  }
  get position() { return this.integrator.position; }
  set position(value) {
    this.integrator.position = value;
    this.setPosition(value);
  }
  get velocity() { return this.integrator.velocity; }
  set velocity(value) { this.integrator.velocity = value; }
  get center() { return this._isWorld ? this.position : ORIGIN; }
  get angle() { return this.integrator.angle; }
  set angle(value) { this.setAngle(value); }
  get massInfo() { return this.integrator.massInfo; }
  set massInfo(value) { this.integrator.massInfo = value; }
  get material() { return this.integrator.material; }
  set material(value) {
    this.integrator.material = value;
    this.updateMassInfo();
  }
  protected _data?: VectorGroups;
  get data(): VectorGroups { return this._data || (this._data = new VectorGroups()); }
  get vertexList() { return this.data.get("vertex"); }
  get edgeVectorList() { return this.data.get("edge"); }
  get normalList() { return this.data.get("normal"); }
  get hasDynamicAxes() { return false; }
  boundingShape?: Shape;
  referenceShape?: Shape;
  get usesReferenceShape() { return false; }
  protected _isTransformDirty = true;
  protected _transform: MatrixValues;
  get transform() {
    if (this._isTransformDirty || this.integrator.isDirty) {
      this.calcTransform(this._transform, this._transformInverse);
      this.cleanTransform();
    }

    return this._transform;
  }
  protected _transformInverse: MatrixValues;
  get transformInverse() {
    if (this._isTransformDirty || this.integrator.isDirty) {
      this.calcTransform(this._transform, this._transformInverse);
      this.cleanTransform();
    }

    return this._transformInverse;
  }
  protected _props?: ContextProps;
  get props(): ContextProps { return this._props || { strokeStyle: "black", fillStyle: "black", lineDash: [] }; }
  set props(value) { this._props = value; }

  getVertex(index: number) { return this.vertexList.items[index]; }
  getVertices() { return this.vertexList.items; }
  getEdgeVectors() { return this.edgeVectorList.items; }

  setPosition(position: Vector) {
    this.position.copyFrom(position);
    this.dirtyTransform();
  }

  protected setAngle(radians: number) {
    this.integrator.angle = radians;
    this.dirtyTransform();
  }

  getFurthestEdges(worldDirection: Vector): Edge[] {
    const vertices = this.vertexList.items;
    const vertexCount = this.vertexList.length;

    if (vertexCount < 2) return [];

    // @ts-ignore - "this" not assignable to Shape.
    if (vertexCount === 2) return new EdgeImpl(this, 0);

    let direction = this.toLocal(worldDirection);

    let bestDot = -Infinity;
    let index = -1;

    for (let i = 0; i < vertexCount; i++) {
      const dot = vertices[i].dot(direction);

      if (dot > bestDot) {
        bestDot = dot;
        index = i;
      }
    }

    const prevIndex = index > 0 ? index - 1 : vertexCount - 1;
    // @ts-ignore - "this" not assignable to Shape.
    return [new EdgeImpl(this, prevIndex), new EdgeImpl(this, index)];
  }

  getSupport(direction: Vector, result?: SupportPoint): SupportPoint {
    const vertexCount = this.vertexList.length;
    let lookup = this._supportLookup;

    if (vertexCount === 0) return NullSupportPoint.instance;

    if (lookup === undefined)
      lookup = this.buildSupportLookup();

    if (lookup === null) return NullSupportPoint.instance;

    let low = 0;
    let high = lookup.length;

    while (low < high) {
      const middle = Math.floor((low + high) * 0.5);

      if (middle < 0 || middle > lookup.length - 1)
        debugger;

      if (lookup[middle][0].compareAngle(direction) > 0)
        high = middle;
      else
        low = middle + 1;
    }

    const index = low > 0 ? low - 1 : lookup.length - 1;
    let support = lookup[index][1];
    // support.direction = direction.clone();
    support.worldPoint = Vector.empty;
    support.worldDirection = Vector.empty;

    return result ? support.clone(result) : support;
  }

  getSupportFromAxis(axis: ShapeAxis, result?: SupportPoint): SupportPoint {
    const vertexCount = this.vertexList.length;
    let lookup = this._supportLookup;

    if (vertexCount === 0) return NullSupportPoint.instance;

    if (lookup === undefined)
      lookup = this.buildSupportLookup();

    if (lookup === null) return NullSupportPoint.instance;

    let axisDirection = axis.normal;
    let axisPoint = axis.point;

    let low = 0;
    let high = lookup.length;

    while (low < high) {
      const middle = Math.floor((low + high) * 0.5);

      if (middle < 0 || middle > lookup.length - 1)
        debugger;

      if (lookup[middle][0].compareAngle(axisDirection) > 0)
        high = middle;
      else
        low = middle + 1;
    }

    const index = low > 0 ? low - 1 : lookup.length - 1;
    let support = lookup[index][1];
    support.direction = axisDirection.clone();
    support.worldPoint = Vector.empty;
    support.worldDirection = Vector.empty;
    const pointToVertex = support.point.subO(axisPoint);
    support.distance = pointToVertex.dot(axisDirection);

    return result ? support.clone(result) : support;
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
  getIterator(index: number, isWorld?: boolean, circleSegments?: CircleSegmentInfo): GeometryIterator {
    // @ts-ignore - assigment compatibility.
    return new ShapeIterator(this, index, isWorld);
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

  protected updateMassInfo() {
    const mass = this._area * this._integrator.material.density;

    if (mass === 0) {
      this._integrator.massInfo = MassInfo.empty;
      return;
    }

    const inertia = this._calcInertia(mass);
    this._integrator.massInfo = new MassInfo(mass, inertia);
  }

  protected calcSupport(direction: Vector, ignoreIndex: number = -1): SupportPoint | null {
    const vertices = this.vertexList.items;
    const vertexCount = this.vertexList.length;

    let bestVertex = vertices[0];
    let bestDistance = -Infinity;
    let bestIndex = -1;

    for (let i = 0; i < vertexCount; i++) {
      const vertex = vertices[i];
      const distance = vertex.dot(direction);

      if (distance > bestDistance) {
        bestVertex = vertex;
        bestIndex = i;
        bestDistance = distance;
      }
    }

    if (bestIndex === ignoreIndex) return null;

    // @ts-ignore - "this" not assignable to Shape.
    const result = new SupportPointImpl(this);
    // @ts-ignore - "this" not assignable to Shape.
    result.shape = this;
    result.point = bestVertex;
    result.index = bestIndex;
    result.distance = NaN;
    result.direction = Vector.empty;
    return result;
  }

  protected buildSupportLookup() {
    const lookup: [Vector, SupportPoint][] = [];
    this._supportLookup = lookup;
    const direction = dir(1, 0);
    const support = this.calcSupport(direction);
    let prevIndex = support!.index;
    direction.rotateNegativeOneDegree();

    for (let a = 0; a < 360; a++) {
      direction.rotateOneDegree();
      const newSupport = this.calcSupport(direction, prevIndex);

      if (!newSupport) continue;

      prevIndex = newSupport.index;
      lookup.push([direction.clone(), newSupport]);
    }

    return lookup;
  }

  protected dirtyTransform() { this._isTransformDirty = true; }
  protected cleanTransform() { this._isTransformDirty = false; }

  protected calcTransform(transform: MatrixValues, transformInverse: MatrixValues) {
    const matrix = this.matrix;
    const position = this.position;

    if (this._isWorld) {
      matrix
        .setToIdentity()
        .translate(position)
        .rotate2D(this.angle)
        .translate(position.negateO());
    } else {
      matrix
        .setToIdentity()
        .setRotation2D(this.angle)
        .setTranslation(position);
    }

    matrix.getValues(transform);
    matrix.getInverse(transformInverse);
  }
}
