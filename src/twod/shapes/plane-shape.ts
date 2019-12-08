import { GeometryIterator, IPlaneShape, PlaneIterator, ShapeAxis, ShapeBase, SupportPoint, SupportPointImpl } from '.';
import { ContextProps, Viewport } from '..';
import { Vector } from '../../vectors';
import { CircleSegmentInfo } from '../utils';

export class PlaneShape extends ShapeBase implements IPlaneShape {
  kind: "plane" = "plane";

  constructor(
    point1: Vector,
    point2: Vector,
    isWorld?: boolean) {
    super();

    if (isWorld)
      this._isWorld = true;

    const ab = point2.subO(point1);
    const axb = point1.cross2D(point2);
    this.normal = axb >= 0 ? ab.perpLeft().normalize() : ab.perpRight().normalize();
    this.distance = this.normal.dot(point1);
    this.position = this.normal.scaleO(this.distance).asPosition();
  }

  readonly normal: Vector;

  distance: number;
  get direction() { return this.normal.perpO(); }
  get usesReferenceShape() { return true; }

  getVertices() {
    if (!this.referenceShape)
      throw new Error("Must set referenceShape before getting vertices.");

    const iterator = this.getIterator(0, false);
    return iterator.vertices;
  }

  getVertex(index: number) {
    if (!this.referenceShape)
      throw new Error("Must set referenceShape before getting vertices.");

    const iterator = this.getIterator(0, false);
    return index === 0 ? iterator.vertex : iterator.nextVertex;
  }

  getEdgeVectors() {
    if (!this.referenceShape)
      throw new Error("Must set referenceShape before getting edge vectors.");

    const iterator = this.getIterator(0, false);
    return iterator.edgeVectors;
  }

  setPosition(position: Vector) {
    super.setPosition(position);
    this.distance = position.dot(this.normal);
    this.normal.scaleO(this.distance, this.position).asPosition();
  }

  getSupport(direction: Vector, result?: SupportPoint): SupportPoint {
    if (!this.referenceShape)
      throw new Error("Must set referenceShape before getting support points.");

    const iterator = this.getIterator(0, false);
    let point: Vector;
    let index: number;

    if (iterator.vertex.dot(direction) > iterator.nextVertex.dot(direction)) {
      point = iterator.vertex;
      index = 0;
    } else {
      point = iterator.nextVertex;
      index = 1;
    }

    result || (result = new SupportPointImpl(this));

    result.shape = this;
    result.point = point;
    result.index = index;
    result.distance = NaN;
    result.direction = Vector.empty;
    result.direction = direction.clone();
    result.worldPoint = Vector.empty;
    result.worldDirection = Vector.empty;

    return result;
  }

  getSupportFromAxis(axis: ShapeAxis, result?: SupportPoint): SupportPoint {
    if (!this.referenceShape)
      throw new Error("Must set referenceShape before getting support points.");

    const axisDirection = axis.normal;
    const axisPoint = axis.point;

    const iterator = this.getIterator(0, false);
    let point: Vector;
    let index: number;

    if (iterator.vertex.dot(axisDirection) > iterator.nextVertex.dot(axisDirection)) {
      point = iterator.vertex;
      index = 0;
    } else {
      point = iterator.nextVertex;
      index = 1;
    }

    const pointToVertex = point.subO(axisPoint);

    result || (result = new SupportPointImpl(this));

    result.shape = this;
    result.point = point;
    result.index = index;
    result.distance = pointToVertex.dot(axisDirection);
    result.direction = Vector.empty;
    result.direction = axisDirection.clone();
    result.worldPoint = Vector.empty;
    result.worldDirection = Vector.empty;

    return result;
  }

  // @ts-ignore - unused param.
  getIterator(index: number, isWorld?: boolean, circleSegments?: CircleSegmentInfo): GeometryIterator {
    if (!this.referenceShape)
      throw new Error("Must set referenceShape before getting iterator.");

    return new PlaneIterator(this, this.referenceShape, index, isWorld);
  }

  protected renderCore(view: Viewport, props: ContextProps) {
    const mag = view.viewBounds.max.subO(view.viewBounds.min).magSquared;
    const dir = this.direction.scale(mag);
    const start = dir.asPosition();
    const end = dir.negateO().asPosition();

    view.ctx.beginPath().line(start, end).stroke();
    this.normal.render(view, Vector.position(0, 0), props);
  }
}
