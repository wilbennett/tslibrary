import {
  calcCircleIndex,
  CircleIterator,
  CircleSegmentInfo,
  ICircleShape,
  ORIGIN,
  Projection,
  Shape,
  ShapeAxis,
  ShapeBase,
  SupportPoint,
  SupportPointImpl,
} from '.';
import { ContextProps, IntegratorClass, Viewport } from '..';
import { MassInfo, Material, Tristate } from '../../core';
import { dir, Vector } from '../../vectors';

export class CircleShape extends ShapeBase implements ICircleShape {
  kind: "circle" = "circle";

  constructor(
    radius: number,
    material?: Material,
    isWorld?: boolean,
    massInfo?: MassInfo,
    integratorType?: IntegratorClass) {
    super(Math.PI * radius * radius, isWorld, material, massInfo, integratorType, m => m * radius * radius);

    this.radius = radius;
  }

  radius: number;
  get hasDynamicAxes() { return true; }

  getVertex(index: number) {
    const iterator = this.getIterator(index);
    return iterator.vertex;
  }

  getSupport(direction: Vector, result?: SupportPoint): SupportPoint {
    // direction = direction.rotateO(-this.angle);

    if (direction.magSquared !== 1)
      direction = direction.normalizeO();

    const point = direction.scaleO(this.radius).asPosition();

    result || (result = new SupportPointImpl(this));
    result.clear();
    result.shape = this;
    result.point = point;
    result.index = calcCircleIndex(direction.radians);
    result.distance = point.dot(direction);
    return result;
  }

  getSupportFromAxis(axis: ShapeAxis, result?: SupportPoint): SupportPoint {
    let axisDirection = axis.normal;
    let axisPoint = axis.point;

    const point = axisDirection.scaleO(this.radius).asPosition();
    const pointToVertex = point.subO(axisPoint);

    result || (result = new SupportPointImpl(this));
    result.clear();
    result.shape = this;
    result.point = point;
    result.direction = axis.normal.clone();
    result.distance = pointToVertex.dot(axisDirection);
    return result;
  }

  getDynamicAxes(other: Shape, result?: ShapeAxis[]) {
    result || (result = []);
    const posInOtherSpace = other.toLocal(this.position);
    const closestInOtherSpace = other.closestPoint(posInOtherSpace);
    let normal: Vector;
    // console.log(`position: ${this.position} => ${posInOtherSpace}, closest: ${closestInOtherSpace}`);

    if (closestInOtherSpace === null || closestInOtherSpace === undefined) return result;

    // TODO: Need to account for world shapes?
    if (closestInOtherSpace.equals(ORIGIN)) {
      // If centers are at the same position, return an arbitrary normal.
      normal = Vector.direction(0, 1);
    } else {
      const closest = other.toLocalOf(this, closestInOtherSpace);
      normal = closest.asDirection().normalize();
    }

    const point = normal.scaleO(this.radius).asPosition();
    result.push(new ShapeAxis(this, normal, point));
    return result;
  }

  projectOn(worldAxis: Vector, result?: Projection): Tristate<Projection> {
    const maxPoint = this.position.displaceByScaledO(worldAxis, this.radius);
    const minPoint = this.position.displaceByNegScaledO(worldAxis, this.radius);
    const maxValue = maxPoint.dot(worldAxis);
    const minValue = minPoint.dot(worldAxis);

    result || (result = new Projection());

    result.min = minValue;
    result.max = maxValue;
    result.minPoint = minPoint;
    result.maxPoint = maxPoint;

    return result;
  }

  protected createIterator(isWorld: boolean, circleSegments?: CircleSegmentInfo) {
    return new CircleIterator(this, 0, isWorld, circleSegments);
  }

  protected renderCore(view: Viewport, props: ContextProps) {
    const ctx = view.ctx;

    ctx
      .beginPath()
      .circle(this.center, this.radius)
      .moveTo(this.center)
      .lineTo(this.center.addO(dir(this.radius, 0)));

    props.fillStyle && ctx.fill();
    props.strokeStyle && ctx.stroke();
  }
}
